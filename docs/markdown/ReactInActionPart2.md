# React на практике — Часть 2

> Практическое руководство по книге «React In Action» (Thomas M.T.)
> Философия: учимся делая. Минимум теории — максимум кода.
>
> **Адаптировано для React 19.** Используется `createRoot` из `react-dom/client`. Enzyme заменён на React Testing Library (современный стандарт). Устаревшие паттерны отмечены.

---

## Содержание

1. [Роутинг: строим Router с нуля](#1-роутинг-строим-router-с-нуля)
2. [Подключаем Router к приложению](#2-подключаем-router-к-приложению)
3. [Компонент Link и навигация без перезагрузки](#3-компонент-link-и-навигация-без-перезагрузки)
4. [Страница поста и параметры маршрута](#4-страница-поста-и-параметры-маршрута)
5. [Страница 404 (NotFound)](#5-страница-404-notfound)
6. [Аутентификация через Firebase](#6-аутентификация-через-firebase)
7. [Тестирование: настройка Jest](#7-тестирование-настройка-jest)
8. [Тестируем простой компонент (shallow render)](#8-тестируем-простой-компонент-shallow-render)
9. [Тестируем компонент с состоянием](#9-тестируем-компонент-с-состоянием)
10. [Snapshot-тесты](#10-snapshot-тесты)
11. [Покрытие кода (Coverage)](#11-покрытие-кода-coverage)

---

## 1. Роутинг: строим Router с нуля

### Задача

Создать собственную систему маршрутизации из двух компонентов — `Route` и `Router`. Это позволит сопоставлять URL-адреса с React-компонентами: пользователь заходит на `/posts/123` — видит конкретный пост.

> **Зачем строить свой роутер?** В реальных проектах используют React Router. Но построить свой — лучший способ понять, как роутинг работает внутри. После этого упражнения React Router покажется тебе простым и логичным.

### Шаг 1. Компонент Route

`Route` — это компонент-контейнер данных. Он **ничего не рендерит**. Его задача — хранить связку «путь ↔ компонент». Если кто-то случайно попытается его отрендерить, мы выбросим ошибку.

```bash
npm install invariant prop-types enroute
```

**src/components/router/Route.js:**
```jsx
import PropTypes from 'prop-types';
import { Component } from 'react';
import invariant from 'invariant';

class Route extends Component {
  static propTypes = {
    path: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  };

  render() {
    return invariant(false, "<Route> — только для конфигурации, рендерить нельзя");
  }
}

export default Route;
```

### Шаг 2. Каркас Router

`Router` — главный компонент. Он принимает `location` (текущий URL) и `children` (набор `<Route>`). Его работа — найти подходящий маршрут и отрендерить нужный компонент.

**src/components/router/Router.js:**
```jsx
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import enroute from 'enroute';
import invariant from 'invariant';

export default class Router extends Component {
  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.routes = {};
    this.addRoutes(props.children);
    this.router = enroute(this.routes);
  }

  render() {
    const { location } = this.props;
    invariant(location, '<Router/> требует location');
    return this.router(location);
  }
}
```

`enroute` — микробиблиотека для сопоставления URL-шаблонов с функциями. Мы передаём ей объект `{ '/path': renderFunction }`, а она возвращает функцию-роутер, которую можно вызвать с URL.

### Шаг 3. Вспомогательные методы

Добавим в `Router` утилиты для обработки путей:

```jsx
// Убирает двойные слэши: //posts//1 → /posts/1
cleanPath(path) {
  return path.replace(/\/\//g, '/');
}

// Собирает путь из родительского и дочернего маршрутов
normalizeRoute(path, parent) {
  if (path[0] === '/') return path;       // абсолютный путь — оставить как есть
  if (!parent) return path;               // нет родителя — вернуть как есть
  return `${parent.route}/${path}`;       // соединить: /parent/child
}
```

### Шаг 4. Добавление маршрутов (ключевая логика)

Это ядро роутера. Для каждого дочернего `<Route>` мы берём его `path` и `component`, создаём функцию рендеринга и регистрируем её в `this.routes`.

```jsx
addRoute(element, parent) {
  const { component, path, children } = element.props;

  invariant(component, `Route ${path}: отсутствует component`);
  invariant(typeof path === 'string', `Route ${path}: path должен быть строкой`);

  const render = (params, renderProps) => {
    const finalProps = Object.assign({ params }, this.props, renderProps);
    const child = React.createElement(component, finalProps);
    return parent ? parent.render(params, { children: child }) : child;
  };

  const route = this.normalizeRoute(path, parent);

  if (children) {
    this.addRoutes(children, { route, render });
  }

  this.routes[this.cleanPath(route)] = render;
}

addRoutes(routes, parent) {
  React.Children.forEach(routes, route => this.addRoute(route, parent));
}
```

### Что получилось

Полный `Router`:

**src/components/router/Router.js:**
```jsx
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import enroute from 'enroute';
import invariant from 'invariant';

export default class Router extends Component {
  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.routes = {};
    this.addRoutes(props.children);
    this.router = enroute(this.routes);
  }

  addRoute(element, parent) {
    const { component, path, children } = element.props;
    invariant(component, `Route ${path}: отсутствует component`);
    invariant(typeof path === 'string', `Route ${path}: path должен быть строкой`);

    const render = (params, renderProps) => {
      const finalProps = Object.assign({ params }, this.props, renderProps);
      const child = React.createElement(component, finalProps);
      return parent ? parent.render(params, { children: child }) : child;
    };

    const route = this.normalizeRoute(path, parent);
    if (children) {
      this.addRoutes(children, { route, render });
    }
    this.routes[this.cleanPath(route)] = render;
  }

  addRoutes(routes, parent) {
    React.Children.forEach(routes, route => this.addRoute(route, parent));
  }

  cleanPath(path) {
    return path.replace(/\/\//g, '/');
  }

  normalizeRoute(path, parent) {
    if (path[0] === '/') return path;
    if (!parent) return path;
    return `${parent.route}/${path}`;
  }

  render() {
    const { location } = this.props;
    invariant(location, '<Router/> требует location');
    return this.router(location);
  }
}
```

### Как это работает (просто)

```
<Router location="/">
  <Route path="/" component={Home} />
  <Route path="/about" component={About} />
</Router>
```

1. `Router` получает `children` — два `<Route>`.
2. В конструкторе `addRoutes` обходит каждый `<Route>` через `React.Children.forEach`.
3. Для каждого `<Route>` берётся `path` и `component`, создаётся функция рендеринга.
4. Эти функции складываются в `this.routes = { '/': renderHome, '/about': renderAbout }`.
5. `enroute(this.routes)` возвращает функцию, которая по URL находит нужную render-функцию.
6. В `render()` вызываем `this.router(location)` — получаем React-элемент нужного компонента.

> **`React.Children.forEach`** — утилита React для безопасного обхода `props.children`. Она нужна потому, что `children` — это не обычный массив, а специальная структура данных React.

---

## 2. Подключаем Router к приложению

### Задача

Подключить наш Router к приложению Letters Social, используя HTML5 History API для навигации без перезагрузки страницы.

### Шаг 1. Утилита history

Библиотека `history` — обёртка над браузерным History API. Она позволяет программно менять URL и слушать его изменения.

```bash
npm install history
```

**src/history/history.js:**
```javascript
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
const navigate = (to) => history.push(to);

export { history, navigate };
```

### Шаг 2. Рефакторинг App

`App` теперь становится layout-обёрткой. Центральная область будет меняться через `props.children` в зависимости от маршрута.

**src/app.js:**
```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorMessage from './components/error/Error';
import Nav from './components/nav/navbar';

class App extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  constructor(props) {
    super(props);
    this.state = { error: null, loading: false };
  }

  componentDidCatch(err, info) {
    console.error(err);
    console.error(info);
    this.setState({ error: err });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <ErrorMessage error={this.state.error} />
        </div>
      );
    }

    return (
      <div className="app">
        <Nav user={this.props.user} />
        {this.props.children}
      </div>
    );
  }
}

export default App;
```

### Шаг 3. Настраиваем маршруты в index.js

**src/index.js:**
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import Home from './pages/home';
import Router from './components/router/Router';
import Route from './components/router/Route';
import { history } from './history/history';

const root = createRoot(document.getElementById('app'));

let state = {
  location: window.location.pathname,
};

function renderApp(appState) {
  root.render(
    <Router {...appState}>
      <Route path="" component={App}>
        <Route path="/" component={Home} />
      </Route>
    </Router>
  );
}

history.listen(({ pathname }) => {
  state = { ...state, location: pathname };
  renderApp(state);
});

renderApp(state);
```

### Что произошло

- `history.listen` слушает изменения URL в браузере.
- При каждом изменении мы обновляем `state.location` и перерендериваем приложение.
- `Router` получает новый `location`, вызывает `enroute`, и нужный компонент отрисовывается.
- `App` — обёртка с навбаром. Его `children` меняются в зависимости от URL.

> **Вложенность маршрутов:** `<Route path="" component={App}>` — корневой маршрут-обёртка. Все дочерние `<Route>` рендерятся внутри `App.props.children`. Это позволяет сохранить навбар на всех страницах.

---

## 3. Компонент Link и навигация без перезагрузки

### Задача

Создать компонент `Link`, который позволяет навигироваться по приложению без полной перезагрузки страницы (в отличие от обычного `<a href>`).

### Шаг 1. Создаём Link

`Link` клонирует свой единственный дочерний элемент и добавляет ему обработчик `onClick`, который использует `history.push()` вместо обычной навигации.

**src/components/router/Link.js:**
```jsx
import PropTypes from 'prop-types';
import { Children, cloneElement } from 'react';
import { navigate } from '../../history/history';

function Link({ to, children }) {
  return cloneElement(Children.only(children), {
    onClick: () => navigate(to),
  });
}

Link.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Link;
```

### Шаг 2. Используем Link в компонентах

Оборачиваем часть поста в `Link`, чтобы по клику пользователь переходил на страницу поста:

```jsx
import RouterLink from '../router/Link';

// В render() компонента Post:
<RouterLink to={`/posts/${this.state.post.id}`}>
  <span>
    <UserHeader date={this.state.post.date} user={this.state.post.user} />
    <Content post={this.state.post} />
    <Image post={this.state.post} />
  </span>
</RouterLink>
```

### Что произошло

- `React.cloneElement` создаёт копию React-элемента с дополнительными/изменёнными props.
- `React.Children.only` гарантирует, что у `Link` ровно один дочерний элемент.
- При клике вызывается `navigate(to)`, что меняет URL через History API.
- `history.listen` в `index.js` реагирует на изменение URL и перерендеривает приложение с новым маршрутом.

> **Почему не обычный `<a href>`?** Обычная ссылка вызывает полную перезагрузку страницы — браузер запрашивает HTML у сервера, всё JavaScript-приложение перезапускается. `Link` же меняет URL «на месте», а React просто перерисовывает нужный компонент. Это мгновенно.

---

## 4. Страница поста и параметры маршрута

### Задача

Создать страницу отдельного поста, доступную по URL вида `/posts/12345`. ID поста берётся из URL.

### Шаг 1. Компонент SinglePost

**src/pages/post.js:**
```jsx
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Post from '../components/post/Post';

class SinglePost extends Component {
  static propTypes = {
    params: PropTypes.shape({
      postId: PropTypes.string.isRequired,
    }),
  };

  render() {
    return (
      <div className="single-post">
        <Post id={this.props.params.postId} />
      </div>
    );
  }
}

export default SinglePost;
```

### Шаг 2. Добавляем маршрут

В `index.js` добавляем маршрут с параметром:

```jsx
import SinglePost from './pages/post';

// В renderApp:
<Router {...appState}>
  <Route path="" component={App}>
    <Route path="/" component={Home} />
    <Route path="/posts/:postId" component={SinglePost} />
  </Route>
</Router>
```

### Что произошло

- `:postId` в пути — это параметр маршрута. `enroute` извлекает его значение из URL.
- Когда пользователь переходит на `/posts/abc123`, роутер вызывает render-функцию с `params = { postId: 'abc123' }`.
- Компонент `SinglePost` получает `this.props.params.postId` и передаёт его компоненту `Post`.

> **Параметризация маршрутов** — мощный инструмент. URL `/users/:userId/posts` при посещении `/users/42/posts` даст `params = { userId: '42' }`. Можно комбинировать несколько параметров в одном пути.

---

## 5. Страница 404 (NotFound)

### Задача

Показать дружественное сообщение, если пользователь перешёл по несуществующему маршруту.

### Шаг 1. Компонент NotFound

**src/pages/404.js:**
```jsx
import React from 'react';
import Link from '../components/router/Link';

const NotFound = () => (
  <div className="not-found">
    <h2>Страница не найдена :(</h2>
    <Link to="/">
      <button>Вернуться на главную</button>
    </Link>
  </div>
);

export default NotFound;
```

### Шаг 2. Добавляем catch-all маршрут

```jsx
import NotFound from './pages/404';

<Router {...appState}>
  <Route path="" component={App}>
    <Route path="/" component={Home} />
    <Route path="/posts/:postId" component={SinglePost} />
    <Route path="*" component={NotFound} />
  </Route>
</Router>
```

### Что произошло

- `path="*"` — catch-all маршрут. Он перехватывает любой URL, который не совпал с предыдущими.
- **Порядок маршрутов важен!** Catch-all `*` должен быть последним, иначе он перехватит всё.

---

## 6. Аутентификация через Firebase

### Задача

Добавить систему входа пользователей с помощью Firebase Authentication. Пользователи смогут войти через свой GitHub-аккаунт.

### Шаг 1. Создаём проект Firebase

1. Зайди на [console.firebase.google.com](https://console.firebase.google.com).
2. Создай новый проект.
3. В разделе **Authentication → Sign-in method** включи провайдер GitHub.
4. Следуй инструкциям: создай OAuth App на GitHub, скопируй Client ID и Secret в Firebase.
5. Скопируй из Firebase конфигурационные значения (`apiKey`, `authDomain`).

### Шаг 2. Инициализация Firebase

```bash
npm install firebase
```

**src/backend/core.js:**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: process.env.GOOGLE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(config);
const auth = getAuth(app);

export { auth };
```

### Шаг 3. Утилиты аутентификации

**src/backend/auth.js:**
```javascript
import { GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './core';

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export function loginWithGithub() {
  return signInWithPopup(auth, githubProvider);
}

export function logUserOut() {
  return signOut(auth);
}

export function getFirebaseUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => resolve(user));
  });
}

export function getFirebaseToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) return Promise.resolve(null);
  return currentUser.getIdToken(true);
}
```

### Шаг 4. Страница Login

**src/pages/Login.js:**
```jsx
import React, { Component } from 'react';
import { history } from '../history/history';
import { loginWithGithub } from '../backend/auth';

class Login extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }

  login() {
    loginWithGithub().then(() => {
      history.push('/');
    });
  }

  render() {
    return (
      <div className="login">
        <h2>Добро пожаловать в Letters Social</h2>
        <button onClick={this.login}>
          Войти через GitHub
        </button>
      </div>
    );
  }
}

export default Login;
```

### Шаг 5. Защита маршрутов

Обновляем `index.js` — добавляем маршрут логина, состояние пользователя и редирект для неавторизованных:

```jsx
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './backend/core';
import { getFirebaseToken } from './backend/auth';
import * as API from './shared/http';
import Login from './pages/Login';
import NotFound from './pages/404';

let state = {
  location: window.location.pathname,
  user: {
    authenticated: false,
    profilePicture: null,
    id: null,
    name: null,
    token: null,
  },
};

function renderApp(appState) {
  root.render(
    <Router {...appState}>
      <Route path="" component={App}>
        <Route path="/" component={Home} />
        <Route path="/posts/:postId" component={SinglePost} />
        <Route path="/login" component={Login} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  );
}

history.listen(({ pathname }) => {
  const user = auth.currentUser;
  state = { ...state, location: user ? pathname : '/login' };
  renderApp(state);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    state = { ...state, location: state.location, user: { authenticated: false } };
    renderApp(state);
    history.push('/login');
    return;
  }

  const token = await getFirebaseToken();
  const res = await API.loadUser(user.uid);

  let appUser;
  if (res.status === 404) {
    const payload = {
      name: user.displayName,
      profilePicture: user.photoURL,
      id: user.uid,
    };
    appUser = await API.createUser(payload).then((r) => r.json());
  } else {
    appUser = await res.json();
  }

  state = {
    ...state,
    location: '/',
    user: {
      name: appUser.name,
      id: appUser.id,
      profilePicture: appUser.profilePicture,
      authenticated: true,
    },
    token,
  };

  history.push('/');
  renderApp(state);
});

renderApp(state);
```

### Шаг 6. Навбар с информацией о пользователе

**src/components/nav/navbar.js:**
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import Link from '../router/Link';
import { logUserOut } from '../../backend/auth';

const Navigation = ({ user }) => (
  <nav className="navbar">
    <span className="logo">Letters Social</span>
    {user.authenticated ? (
      <span className="user-nav-widget">
        <span>{user.name}</span>
        <img width={40} src={user.profilePicture} alt={user.name} />
        <button onClick={() => logUserOut()}>Выйти</button>
      </span>
    ) : (
      <Link to="/login">
        <button>Войти</button>
      </Link>
    )}
  </nav>
);

Navigation.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    authenticated: PropTypes.bool,
    profilePicture: PropTypes.string,
  }).isRequired,
};

export default Navigation;
```

### Что произошло

Мы построили полный цикл аутентификации:

1. **Пользователь не залогинен** → `onAuthStateChanged` срабатывает с `user = null` → редирект на `/login`.
2. **Пользователь нажимает «Войти»** → открывается popup GitHub → Firebase обрабатывает OAuth.
3. **Успешный вход** → `onAuthStateChanged` срабатывает с данными пользователя → проверяем, есть ли он в нашей БД → если нет, создаём → обновляем состояние → рендерим главную.
4. **Навбар** показывает имя и аватар, или кнопку «Войти».

> **Firebase** — это «бэкенд как сервис». Он берёт на себя хранение данных пользователей, OAuth, токены. В реальном проекте ты можешь заменить Firebase на свой бэкенд с JWT-аутентификацией — паттерн останется тем же: проверяем авторизацию → рендерим нужный маршрут.

---

## 7. Тестирование: настройка Jest

### Задача

Настроить тестовое окружение для React-приложения.

### Шаг 1. Установка

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom react-test-renderer
```

> **Почему не Enzyme?** Книга использует Enzyme, но он не поддерживает React 18+. Индустрия перешла на **React Testing Library** — она тестирует компоненты так, как их видит пользователь (по тексту, ролям, лейблам), а не по внутренней структуре. Мы покажем оба подхода.

### Шаг 2. Конфигурация в package.json

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch --coverage"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterSetup": ["@testing-library/jest-dom"]
  }
}
```

### Шаг 3. Структура тестовых файлов

Тесты размещаются рядом с исходными файлами с суффиксом `.test.js`:

```
src/
  components/
    post/
      Content.js
      Content.test.js
      Create.js
      Create.test.js
```

Jest автоматически находит файлы `*.test.js` и `*.spec.js`.

### Запуск

```bash
npm test            # однократный запуск + отчёт покрытия
npm run test:watch  # автоматический перезапуск при изменениях
```

### Анатомия теста

```javascript
describe('Группа тестов', () => {       // группировка (необязательна, но полезна)
  test('описание конкретного теста', () => {
    // 1. Подготовка (Arrange)
    // 2. Действие (Act)
    // 3. Проверка (Assert)
    expect(результат).toBe(ожидание);
  });
});
```

---

## 8. Тестируем простой компонент (shallow render)

### Задача

Протестировать компонент `Content`, который просто отображает текст поста.

### Компонент

**src/components/post/Content.js:**
```jsx
import React from 'react';
import PropTypes from 'prop-types';

const Content = ({ post }) => (
  <p className="content">{post.content}</p>
);

Content.propTypes = {
  post: PropTypes.object,
};

export default Content;
```

### Тест (React Testing Library)

**src/components/post/Content.test.js:**
```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Content from './Content';

describe('<Content />', () => {
  test('рендерит текст поста', () => {
    const mockPost = { content: 'Учу React — тестирую компоненты!' };

    render(<Content post={mockPost} />);

    expect(screen.getByText('Учу React — тестирую компоненты!')).toBeInTheDocument();
  });

  test('имеет правильный CSS-класс', () => {
    const mockPost = { content: 'Тест CSS' };

    const { container } = render(<Content post={mockPost} />);

    expect(container.querySelector('p.content')).not.toBeNull();
  });
});
```

### Что произошло

- `render()` из Testing Library рендерит компонент в виртуальный DOM (jsdom).
- `screen.getByText()` ищет элемент по его текстовому содержимому — так же, как его видит пользователь.
- `expect(...).toBeInTheDocument()` — матчер из `@testing-library/jest-dom`.
- `container.querySelector` — запасной вариант, когда нужно проверить CSS-класс или структуру HTML.

> **Принцип Testing Library:** «Чем больше ваши тесты похожи на то, как пользователь работает с приложением, тем больше уверенности они вам дают.»

### Для сравнения: тот же тест на Enzyme (устаревший подход)

```jsx
import { shallow } from 'enzyme';
import Content from './Content';

test('рендерит текст', () => {
  const wrapper = shallow(<Content post={{ content: 'Текст' }} />);
  expect(wrapper.find('p.content').text()).toBe('Текст');
});
```

Enzyme тестирует внутреннюю структуру компонента (ищет `p.content`). Testing Library тестирует поведение (ищет текст). Оба подхода рабочие, но Testing Library более устойчив к рефакторингу.

---

## 9. Тестируем компонент с состоянием

### Задача

Протестировать `CreatePost` — компонент с формой, состоянием и колбэками.

### Компонент (упрощённая версия)

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CreatePost extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { content: '', valid: false };
    this.handlePostChange = this.handlePostChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlePostChange(event) {
    const content = event.target.value;
    this.setState({ content, valid: content.length > 0 && content.length <= 300 });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.valid) return;
    this.props.onSubmit({ content: this.state.content });
    this.setState({ content: '', valid: false });
  }

  render() {
    return (
      <div className="create-post">
        <textarea
          value={this.state.content}
          onChange={this.handlePostChange}
          placeholder="Что нового?"
        />
        <button onClick={this.handleSubmit}>Опубликовать</button>
      </div>
    );
  }
}

export default CreatePost;
```

### Тесты

**src/components/post/Create.test.js:**
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreatePost from './Create';

describe('<CreatePost />', () => {
  test('рендерит textarea и кнопку', () => {
    render(<CreatePost onSubmit={jest.fn()} />);

    expect(screen.getByPlaceholderText('Что нового?')).toBeInTheDocument();
    expect(screen.getByText('Опубликовать')).toBeInTheDocument();
  });

  test('обновляет textarea при вводе', () => {
    render(<CreatePost onSubmit={jest.fn()} />);

    const textarea = screen.getByPlaceholderText('Что нового?');
    fireEvent.change(textarea, { target: { value: 'Мой первый пост!' } });

    expect(textarea.value).toBe('Мой первый пост!');
  });

  test('вызывает onSubmit с содержимым при клике', () => {
    const mockSubmit = jest.fn();
    render(<CreatePost onSubmit={mockSubmit} />);

    const textarea = screen.getByPlaceholderText('Что нового?');
    fireEvent.change(textarea, { target: { value: 'Привет, мир!' } });
    fireEvent.click(screen.getByText('Опубликовать'));

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({ content: 'Привет, мир!' });
  });

  test('не вызывает onSubmit при пустом поле', () => {
    const mockSubmit = jest.fn();
    render(<CreatePost onSubmit={mockSubmit} />);

    fireEvent.click(screen.getByText('Опубликовать'));

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('очищает textarea после успешной отправки', () => {
    render(<CreatePost onSubmit={jest.fn()} />);

    const textarea = screen.getByPlaceholderText('Что нового?');
    fireEvent.change(textarea, { target: { value: 'Тест!' } });
    fireEvent.click(screen.getByText('Опубликовать'));

    expect(textarea.value).toBe('');
  });
});
```

### Что произошло

| Инструмент | Назначение |
|------------|-----------|
| `jest.fn()` | Создаёт mock-функцию. Можно проверить: вызвана ли, сколько раз, с какими аргументами. |
| `fireEvent.change` | Имитирует ввод пользователем текста в поле. |
| `fireEvent.click` | Имитирует клик по элементу. |
| `toHaveBeenCalledWith` | Проверяет, что mock-функция была вызвана с конкретными аргументами. |

### Паттерн тестирования (AAA)

Каждый тест следует паттерну **Arrange → Act → Assert**:

```javascript
test('описание', () => {
  // Arrange: подготовка данных и рендеринг
  const mockFn = jest.fn();
  render(<MyComponent onAction={mockFn} />);

  // Act: имитация действий пользователя
  fireEvent.click(screen.getByText('Кнопка'));

  // Assert: проверка результата
  expect(mockFn).toHaveBeenCalled();
});
```

---

## 10. Snapshot-тесты

### Задача

Создать «снимок» рендеринга компонента и автоматически отслеживать непредвиденные изменения в HTML-структуре.

### Как это работает

1. При первом запуске Jest сохраняет JSON-представление компонента в файл `__snapshots__/`.
2. При следующих запусках Jest сравнивает текущий рендер с сохранённым.
3. Если есть различия — тест падает. Ты решаешь: это баг (исправить код) или намеренное изменение (обновить снимок).

### Пример

**src/components/post/Content.test.js (дополняем):**
```jsx
import React from 'react';
import renderer from 'react-test-renderer';
import Content from './Content';

test('snapshot: Content рендерится корректно', () => {
  const mockPost = { content: 'Snapshot тест!' };

  const tree = renderer.create(<Content post={mockPost} />).toJSON();

  expect(tree).toMatchSnapshot();
});
```

При первом запуске создаётся файл:

**`__snapshots__/Content.test.js.snap`:**
```
exports[`snapshot: Content рендерится корректно 1`] = `
<p
  className="content"
>
  Snapshot тест!
</p>
`;
```

### Обновление снимков

Если ты намеренно изменил компонент и snapshot-тест упал:

```bash
jest --updateSnapshot
# или нажми 'u' в watch-режиме
```

### Когда snapshot-тесты полезны

- Для простых компонентов без сложной логики (иконки, карточки, лейблы).
- Как быстрая «страховка» от случайных изменений вёрстки.

### Когда snapshot-тесты вредят

- Для больших компонентов: снимки становятся огромными, их сложно ревьюить.
- Если разработчики бездумно обновляют снимки (`jest -u`) не глядя на diff.

> **Совет:** snapshot-тесты дополняют, а не заменяют обычные тесты. Используй их для «страховочной сетки», а точные проверки пиши через `expect`.

---

## 11. Покрытие кода (Coverage)

### Задача

Измерить, какая часть кода покрыта тестами.

### Запуск

```bash
npm test -- --coverage
```

Jest выведет таблицу в терминале:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
Content.js          |     100 |      100 |     100 |     100 |
Create.js           |      85 |       70 |      90 |      85 |
--------------------|---------|----------|---------|---------|
```

### Что означают колонки

| Метрика | Что измеряет |
|---------|-------------|
| **Statements** | Процент выполненных JavaScript-выражений. |
| **Branches** | Процент пройденных ветвлений (`if/else`, `? :`). |
| **Functions** | Процент вызванных функций. |
| **Lines** | Процент строк, через которые прошли тесты. |

### HTML-отчёт

Jest создаёт папку `coverage/lcov-report/`. Открой `index.html` в браузере — увидишь детальный отчёт по каждому файлу: какие строки покрыты (зелёные), какие нет (красные).

### Практические ориентиры

- **80%+** — хороший уровень для большинства проектов.
- **100%** — не гарантирует отсутствие багов. Можно покрыть каждую строку, но не проверить все граничные случаи.
- **0%** — не значит, что код сломан. Но значит, что у тебя нет автоматической защиты от регрессий.

> **Coverage — это навигатор, а не цель.** Используй его, чтобы найти непротестированные участки кода, а не чтобы гнаться за числом.

---

## Итоговая шпаргалка

### Роутинг

| Концепция | Описание |
|-----------|----------|
| **Router** | Компонент, который сопоставляет URL с React-компонентами. |
| **Route** | Конфигурационный компонент: связывает `path` с `component`. |
| **Link** | Навигация без перезагрузки через History API. |
| **Параметры** | `:param` в пути — динамическое значение из URL. |
| **Catch-all** | `path="*"` — перехватывает все несовпавшие маршруты. |
| **history** | Библиотека-обёртка над History API. `push()`, `listen()`. |

### Firebase Auth

| Шаг | Что происходит |
|-----|---------------|
| `signInWithPopup` | Открывает окно OAuth (GitHub, Google и т.д.). |
| `onAuthStateChanged` | Слушает изменения состояния авторизации. |
| `signOut` | Выход из системы. |
| `getIdToken` | Получение JWT-токена для запросов к API. |

### Тестирование

| Инструмент | Назначение |
|-----------|-----------|
| **Jest** | Тест-раннер, assertions, mocks, coverage. |
| **React Testing Library** | Рендеринг компонентов, поиск по тексту/роли, имитация событий. |
| **react-test-renderer** | Snapshot-тесты (JSON-снимки компонентов). |
| **jest.fn()** | Mock-функция: отслеживает вызовы и аргументы. |
| **fireEvent** | Имитация пользовательских действий (клик, ввод, submit). |
| **screen** | Глобальный объект для поиска элементов в отрендеренном DOM. |

### Ключевые матчеры Jest

```javascript
expect(value).toBe(42);                   // строгое равенство (===)
expect(value).toEqual({ a: 1 });          // глубокое сравнение объектов
expect(fn).toHaveBeenCalled();            // функция была вызвана
expect(fn).toHaveBeenCalledWith('arg');   // вызвана с конкретным аргументом
expect(fn).toHaveBeenCalledTimes(2);      // вызвана N раз
expect(tree).toMatchSnapshot();           // совпадает со снимком
expect(element).toBeInTheDocument();      // элемент в DOM (Testing Library)
expect(value).toBeTruthy();               // truthy-значение
expect(value).toBeNull();                 // null
```

### О React Router (что использовать в реальных проектах)

Мы построили роутер с нуля для понимания. В реальных приложениях используй **React Router** (`react-router-dom`):

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Главная</Link>
        <Link to="/about">О нас</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:postId" element={<SinglePost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

Принципы те же — но React Router добавляет: вложенные маршруты, lazy loading, loaders, actions, защищённые маршруты и многое другое.
