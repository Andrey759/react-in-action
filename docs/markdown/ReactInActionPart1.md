# React на практике — Часть 1

> Практическое руководство по книге «React In Action» (Thomas M.T.)
> Философия: учимся делая. Минимум теории — максимум кода.
>
> **Адаптировано для React 19.** Используется `createRoot` из `react-dom/client` вместо устаревшего `render` из `react-dom`. Удалённые lifecycle-методы (`componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`) заменены на современные аналоги.

---

## Содержание

1. [Первый компонент и React.createElement](#1-первый-компонент-и-reactcreateelement)
2. [Компоненты-классы, Props и PropTypes](#2-компоненты-классы-props-и-proptypes)
3. [Вложенные компоненты](#3-вложенные-компоненты)
4. [State и обработка событий](#4-state-и-обработка-событий)
5. [Однонаправленный поток данных: от ребёнка к родителю](#5-однонаправленный-поток-данных-от-ребёнка-к-родителю)
6. [JSX — удобный синтаксис](#6-jsx--удобный-синтаксис)
7. [setState и его особенности](#7-setstate-и-его-особенности)
8. [Stateless функциональные компоненты](#8-stateless-функциональные-компоненты)
9. [Жизненный цикл компонента](#9-жизненный-цикл-компонента)
10. [Практика: собираем приложение Letters Social](#10-практика-собираем-приложение-letters-social)
11. [Формы в React](#11-формы-в-react)
12. [Интеграция сторонних библиотек и refs](#12-интеграция-сторонних-библиотек-и-refs)

---

## 1. Первый компонент и React.createElement

### Задача

Создать простейшую страницу с помощью React — без JSX, на чистом `React.createElement`.

### Шаг 1. Подготовка

Создай проект на [CodeSandbox](https://codesandbox.io) или локально. Тебе нужны два файла:

**index.html:**
```html
<div id="root"></div>
```

**index.js:**
```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
```

### Шаг 2. Создаём React-элементы

`React.createElement` — это базовая функция, которая создаёт виртуальные DOM-элементы. Сигнатура:

```javascript
React.createElement(тип, свойства, ...дети)
```

- **тип** — строка HTML-тега (`'div'`, `'h1'`, `'a'`) или React-компонент
- **свойства** — объект атрибутов (аналог HTML-атрибутов)
- **дети** — вложенное содержимое: текст или другие React-элементы

Создадим вложенную структуру:

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));

const element = React.createElement(
  'div', {},
  React.createElement('h1', {}, 'Hello, world!',
    React.createElement('a', { href: 'mailto:test@example.com' },
      React.createElement('h1', {}, 'React In Action'),
      React.createElement('em', {}, '...работает!')
    )
  )
);

root.render(element);
```

Открой страницу — ты увидишь заголовок и ссылку.

### Что произошло

- `React.createElement` создаёт **виртуальные** элементы (лёгкие объекты в памяти).
- `createRoot` создаёт корень React-приложения, а `root.render()` вставляет элементы в **настоящий** DOM.
- React строит дерево рекурсивно: проходит по каждому ребёнку вглубь, пока не дойдёт до текста или пустого узла.

> **Примечание (React 19):** раньше использовалась функция `render()` из `react-dom`, но начиная с React 18 она заменена на `createRoot()` из `react-dom/client`. Старый API `render()` удалён в React 19.

---

## 2. Компоненты-классы, Props и PropTypes

### Задача

Создать компонент `Post`, который принимает данные через `props` и валидирует их через `PropTypes`.

### Шаг 1. Устанавливаем prop-types

Пакет `prop-types` не входит в React начиная с версии 15.5 и поставляется отдельно. Установи его:

```bash
npm install prop-types
```

> **Для TypeScript-проектов** дополнительно установи типы:
> ```bash
> npm install --save-dev @types/prop-types
> ```

### Шаг 2. Создаём компонент

```javascript
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';

const root = createRoot(document.getElementById('root'));

class Post extends Component {
  render() {
    return React.createElement(
      'div',
      { className: 'post' },
      React.createElement(
        'h2',
        { className: 'postAuthor', id: this.props.id },
        this.props.user,
        React.createElement(
          'span',
          { className: 'postBody' },
          this.props.content
        )
      )
    );
  }
}

Post.propTypes = {
  user: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
};

const App = React.createElement(Post, {
  id: 1,
  content: ' said: This is a post!',
  user: 'mark',
});

root.render(App);
```

Результат: на экране появится текст «mark said: This is a post!».

### Что здесь важно

- **Компонент-класс** — это класс, наследующий `React.Component`. Должен иметь метод `render()`, возвращающий ровно один React-элемент.
- **Props** — данные, которые передаются компоненту извне (как атрибуты в HTML). Доступны через `this.props`. **Нельзя изменять** props изнутри компонента.
- **PropTypes** — проверка типов. Не ломает приложение, но пишет предупреждение в консоль, если передали неправильный тип. Полезно для отладки.
- В React вместо `class` используется `className` (потому что `class` — зарезервированное слово в JS).

---

## 3. Вложенные компоненты

### Задача

Создать компонент `Comment` и вложить его в `Post`.

### Шаг 1. Добавляем `this.props.children` в Post

В компоненте `Post` добавь `this.props.children` после содержимого:

```javascript
class Post extends Component {
  render() {
    return React.createElement(
      'div',
      { className: 'post' },
      React.createElement(
        'h2',
        { className: 'postAuthor', id: this.props.id },
        this.props.user,
        React.createElement('span', { className: 'postBody' }, this.props.content)
      ),
      this.props.children
    );
  }
}
```

### Шаг 2. Создаём Comment

```javascript
class Comment extends Component {
  render() {
    return React.createElement(
      'div',
      { className: 'comment' },
      React.createElement(
        'h2',
        { className: 'commentAuthor' },
        this.props.user,
        React.createElement('span', { className: 'commentContent' }, this.props.content)
      )
    );
  }
}

Comment.propTypes = {
  id: PropTypes.number.isRequired,
  content: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
};
```

### Шаг 3. Собираем вместе

```javascript
const App = React.createElement(
  Post,
  { id: 1, content: ' said: This is a post!', user: 'mark' },
  React.createElement(Comment, {
    id: 2,
    user: 'bob',
    content: ' commented: wow! how cool!',
  })
);

root.render(App);
```

### Что здесь важно

- `this.props.children` — это специальный prop. Всё, что вы передаёте **внутрь** компонента (как дочерние элементы), доступно через него.
- Компоненты можно **вкладывать** друг в друга. Это и есть **композиция** — ключевая идея React.
- Связь между компонентами — **родитель-ребёнок**. Родитель передаёт данные вниз через props.

---

## 4. State и обработка событий

### Задача

Создать форму `CreateComment`, которая хранит ввод пользователя в state и реагирует на события.

### Шаг 1. Инициализация state

State — это **изменяемые** данные, которые принадлежат компоненту. Начальное значение задаётся в конструкторе:

```javascript
class CreateComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
      user: '',
    };
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
```

> **Зачем `.bind(this)`?** Методы класса в JavaScript по умолчанию не привязаны к экземпляру. Без `bind` внутри обработчика `this` будет `undefined`.

### Шаг 2. Обработчики событий

```javascript
  handleUserChange(event) {
    const val = event.target.value;
    this.setState(() => ({ user: val }));
  }

  handleTextChange(event) {
    const val = event.target.value;
    this.setState(() => ({ content: val }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState(() => ({ user: '', content: '' }));
  }
```

### Шаг 3. Render

```javascript
  render() {
    return React.createElement(
      'form',
      { className: 'createComment', onSubmit: this.handleSubmit },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Your name',
        value: this.state.user,
        onChange: this.handleUserChange,
      }),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Thoughts?',
        value: this.state.content,
        onChange: this.handleTextChange,
      }),
      React.createElement('input', { type: 'submit', value: 'Post' })
    );
  }
}
```

### Что здесь важно

- **State** (`this.state`) — изменяемые данные компонента. Менять только через `this.setState()`.
- **Props** (`this.props`) — неизменяемые данные, переданные родителем.
- `this.setState()` принимает функцию, которая возвращает новый объект. React **объединяет** его с текущим state (shallow merge) и перерисовывает компонент.
- `event.target.value` — значение поля ввода (стандартный DOM API).
- `event.preventDefault()` — предотвращает стандартное действие (перезагрузку страницы при отправке формы).

> **Попробуй:** убери `onChange` у одного из полей. Ты не сможешь в него печатать! React не даёт DOM измениться, если виртуальный DOM не обновлён.

---

## 5. Однонаправленный поток данных: от ребёнка к родителю

### Задача

Собрать полноценный `CommentBox`: родитель хранит массив комментариев, форма добавляет новые.

### Ключевая идея

В React данные текут **сверху вниз** (от родителя к ребёнку через props). Чтобы передать данные **снизу вверх**, родитель передаёт функцию-callback ребёнку. Ребёнок вызывает её с данными.

### Шаг 1. Mock-данные

```javascript
const data = {
  post: {
    id: 123,
    content: 'What we hope ever to do with ease, we must first learn to do with diligence. — Samuel Johnson',
    user: 'Mark Thomas',
  },
  comments: [
    { id: 0, user: 'David', content: 'such. win.' },
    { id: 1, user: 'Haley', content: 'Love it.' },
    { id: 2, user: 'Peter', content: 'Who was Samuel Johnson?' },
    { id: 3, user: 'Mitchell', content: '@Peter get off Letters and do your homework' },
    { id: 4, user: 'Peter', content: '@mitchell ok :P' },
  ],
};
```

### Шаг 2. Обновляем CreateComment — вызываем callback родителя

```javascript
handleSubmit(event) {
  event.preventDefault();
  this.props.onCommentSubmit({
    user: this.state.user.trim(),
    content: this.state.content.trim(),
  });
  this.setState(() => ({ user: '', content: '' }));
}
```

### Шаг 3. Создаём CommentBox (родитель)

```javascript
class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: this.props.comments,
    };
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
  }

  handleCommentSubmit(comment) {
    comment.id = Date.now();
    const newComments = this.state.comments.concat([comment]);
    this.setState({ comments: newComments });
  }

  render() {
    return React.createElement(
      'div',
      { className: 'commentBox' },
      React.createElement(Post, {
        id: this.props.post.id,
        content: this.props.post.content,
        user: this.props.post.user,
      }),
      this.state.comments.map(function (comment) {
        return React.createElement(Comment, {
          key: comment.id,
          id: comment.id,
          content: comment.content,
          user: comment.user,
        });
      }),
      React.createElement(CreateComment, {
        onCommentSubmit: this.handleCommentSubmit,
      })
    );
  }
}

root.render(
  React.createElement(CommentBox, {
    comments: data.comments,
    post: data.post,
  })
);
```

### Что здесь важно

- **Никогда не изменяй `this.state` напрямую.** Используй `setState`. Прямое изменение — React не узнает о нём и не перерисует компонент.
- **`key`** — обязательный атрибут при рендере списков. React использует его для эффективного обновления DOM. Обычно это уникальный `id` элемента.
- **Поток данных:**
  1. `CommentBox` хранит комментарии в `state` и передаёт `handleCommentSubmit` в `CreateComment` как prop.
  2. `CreateComment` вызывает `this.props.onCommentSubmit(...)` при отправке формы.
  3. `CommentBox` получает новый комментарий, обновляет `state`, React перерисовывает список.

---

## 6. JSX — удобный синтаксис

### Задача

Переписать всё на JSX — привычный HTML-подобный синтаксис внутри JavaScript.

JSX — это **не HTML**. Это синтаксический сахар для создания React-элементов. Раньше Babel преобразовывал JSX в вызовы `React.createElement`, но начиная с React 17 используется новый **JSX Transform** — компилятор автоматически импортирует нужные функции из `react/jsx-runtime`, и вам не нужно явно импортировать `React` только ради JSX.

### Пример: было → стало

**Без JSX:**
```javascript
React.createElement('div', { className: 'post' },
  React.createElement('h2', {}, this.props.user)
)
```

**С JSX:**
```jsx
<div className="post">
  <h2>{this.props.user}</h2>
</div>
```

### Полный CommentBox на JSX

```jsx
class CreateComment extends Component {
  constructor(props) {
    super(props);
    this.state = { content: '', user: '' };
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUserChange(event) {
    this.setState(() => ({ user: event.target.value }));
  }

  handleTextChange(event) {
    this.setState(() => ({ content: event.target.value }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onCommentSubmit({
      user: this.state.user.trim(),
      content: this.state.content.trim(),
    });
    this.setState(() => ({ user: '', content: '' }));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="createComment">
        <input
          value={this.state.user}
          onChange={this.handleUserChange}
          placeholder="Your name"
          type="text"
        />
        <input
          value={this.state.content}
          onChange={this.handleTextChange}
          placeholder="Thoughts?"
          type="text"
        />
        <button type="submit">Post</button>
      </form>
    );
  }
}

class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = { comments: this.props.comments };
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
  }

  handleCommentSubmit(comment) {
    comment.id = Date.now();
    const newComments = this.state.comments.concat([comment]);
    this.setState({ comments: newComments });
  }

  render() {
    return (
      <div className="commentBox">
        <Post
          id={this.props.post.id}
          content={this.props.post.content}
          user={this.props.post.user}
        />
        {this.state.comments.map((comment) => (
          <Comment
            key={comment.id}
            content={comment.content}
            user={comment.user}
          />
        ))}
        <CreateComment onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
}

root.render(
  <CommentBox comments={data.comments} post={data.post} />
);
```

> **Примечание (React 17+):** благодаря новому JSX Transform, вам больше не нужно писать `import React from 'react'` только для использования JSX. Компилятор (Babel, Vite, и т.д.) автоматически добавит нужный импорт. Однако если вы используете `React.Component`, `React.createElement` или другие API React напрямую — импорт по-прежнему нужен.

### Ключевые правила JSX

| HTML | JSX | Почему |
|------|-----|--------|
| `class="..."` | `className="..."` | `class` — зарезервированное слово в JS |
| `for="..."` | `htmlFor="..."` | `for` — зарезервированное слово в JS |
| `<input>` | `<input />` | Все теги должны быть закрыты |
| `onclick="..."` | `onClick={...}` | camelCase + фигурные скобки для выражений |
| `"строка"` | `{"строка"}` или `"строка"` | Выражения JS — в `{}`, строковые литералы — в кавычках |

- Кастомные компоненты пишутся с **большой буквы**: `<Post />`, `<Comment />`.
- HTML-элементы — с **маленькой**: `<div>`, `<span>`, `<input />`.
- Внутри `{}` можно использовать **любое выражение JS**: тернарный оператор, `.map()`, вызовы функций.

---

## 7. setState и его особенности

### setState — главный инструмент изменения данных

```javascript
this.setState(updaterFunction, callback?)
```

`updaterFunction` получает предыдущий state и props:

```javascript
this.setState((prevState, props) => ({
  count: prevState.count + props.incrementBy,
}));
```

### Практический пример: счётчик

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';

class Counter extends React.Component {
  static propTypes = {
    incrementBy: PropTypes.number,
  };

  static defaultProps = {
    incrementBy: 1,
  };

  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick() {
    this.setState((prevState, props) => ({
      count: prevState.count + props.incrementBy,
    }));
  }

  render() {
    return (
      <div>
        <h1>{this.state.count}</h1>
        <button onClick={this.onButtonClick}>++</button>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<Counter incrementBy={1} />);
```

### Подводный камень: shallow merge

`setState` делает **поверхностное слияние** (shallow merge). Если у тебя вложенный объект в state — вложенные свойства **перезаписываются целиком**.

```jsx
class ShallowMerge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        name: 'Mark',
        colors: { favorite: '' },
      },
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({
      user: {
        colors: { favorite: 'blue' },
        // ВНИМАНИЕ: name пропадёт! Shallow merge заменит весь user целиком.
      },
    });
  }

  render() {
    return (
      <div>
        <h1>
          Цвет: {this.state.user.colors.favorite}, Имя: {this.state.user.name}
        </h1>
        <button onClick={this.onClick}>Показать цвет</button>
      </div>
    );
  }
}
```

**После клика** `name` исчезнет! Чтобы этого избежать, копируй объект:

```javascript
this.setState((prevState) => ({
  user: {
    ...prevState.user,
    colors: { favorite: 'blue' },
  },
}));
```

### Правила работы с setState

1. **Никогда** не изменяй `this.state` напрямую (кроме конструктора).
2. **Не вызывай** `setState` в `render()` — это вызовет бесконечный цикл.
3. `setState` **асинхронен** — React может объединить несколько вызовов.
4. Если новое значение зависит от предыдущего — используй **функцию-updater**.

---

## 8. Stateless функциональные компоненты

Если компоненту не нужен state и методы жизненного цикла — используй **функцию** вместо класса:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

function Greeting(props) {
  return <div>Hello {props.for}!</div>;
}

Greeting.propTypes = {
  for: PropTypes.string.isRequired,
};

Greeting.defaultProps = {
  for: 'friend',
};
```

Или стрелочная функция:

```jsx
const Greeting = (props) => <div>Hello {props.for}!</div>;
```

### Когда использовать

- Компонент только отображает данные (не хранит state).
- Компонент не использует lifecycle-методы.
- Это делает код проще, короче и потенциально быстрее.

> **Современный React (16.8+):** с появлением **хуков** (`useState`, `useEffect`, `useRef` и т.д.) функциональные компоненты стали основным способом написания React-кода. Хуки позволяют использовать state, побочные эффекты и другие возможности React без классов. В новых проектах рекомендуется использовать функциональные компоненты с хуками вместо компонентов-классов.

---

## 9. Жизненный цикл компонента

У компонентов-классов есть «жизнь»: рождение (**mounting**), обновление (**updating**), смерть (**unmounting**).

### Практика: наблюдаем lifecycle

Создадим родительский и дочерний компоненты с логированием каждого метода:

```jsx
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

class ChildComponent extends Component {
  constructor(props) {
    super(props);
    console.log('Child: constructor');
    this.state = { name: 'Mark' };
  }

  static getDerivedStateFromProps(props, state) {
    console.log('Child: getDerivedStateFromProps', props, state);
    return null;
  }

  componentDidMount() {
    console.log('Child: componentDidMount');
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('Child: shouldComponentUpdate', nextProps, nextState);
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('Child: getSnapshotBeforeUpdate', prevProps, prevState);
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Child: componentDidUpdate', prevProps, prevState);
  }

  componentWillUnmount() {
    console.log('Child: componentWillUnmount');
  }

  render() {
    console.log('Child: render');
    return <div>Name: {this.props.name}</div>;
  }
}

class ParentComponent extends Component {
  constructor(props) {
    super(props);
    console.log('Parent: constructor');
    this.state = { text: '' };
    this.onInputChange = this.onInputChange.bind(this);
  }

  componentDidMount() {
    console.log('Parent: componentDidMount');
  }

  componentWillUnmount() {
    console.log('Parent: componentWillUnmount');
  }

  onInputChange(e) {
    this.setState({ text: e.target.value });
  }

  render() {
    console.log('Parent: render');
    return (
      <div>
        <h2>Lifecycle demo</h2>
        <input value={this.state.text} onChange={this.onInputChange} />
        <ChildComponent name={this.state.text} />
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<ParentComponent />);
```

### Открой консоль и наблюдай

**При загрузке страницы:**
```
Parent: constructor
Parent: render
Child: constructor
Child: getDerivedStateFromProps
Child: render
Child: componentDidMount    ← ребёнок монтируется первым!
Parent: componentDidMount
```

**При вводе текста:**
```
Parent: render
Child: getDerivedStateFromProps
Child: shouldComponentUpdate
Child: render
Child: getSnapshotBeforeUpdate
Child: componentDidUpdate
```

### Шпаргалка по lifecycle-методам (React 19)

> **Удалены в React 19:** `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`. Если они нужны при миграции старого кода, используйте префикс `UNSAFE_` (например, `UNSAFE_componentWillMount`), но лучше перейти на современные аналоги.

| Метод | Когда вызывается | Можно ли setState |
|-------|-----------------|-------------------|
| `constructor` | Создание компонента | Только `this.state = ...` |
| `static getDerivedStateFromProps(props, state)` | Перед каждым рендером (mounting + updating) | Возвращает объект для обновления state или `null` |
| `render` | Создание виртуального DOM | **Нет!** |
| `componentDidMount` | Компонент вставлен в DOM | Да |
| `shouldComponentUpdate(nextProps, nextState)` | Перед обновлением | Нет |
| `getSnapshotBeforeUpdate(prevProps, prevState)` | Перед применением изменений в DOM | Нет (возвращает значение → передаётся в `componentDidUpdate`) |
| `componentDidUpdate(prevProps, prevState, snapshot)` | После обновления DOM | Да |
| `componentWillUnmount` | Перед удалением из DOM | Нет |
| `componentDidCatch(error, info)` | Ошибка в дочерних компонентах | Да |

### Где что делать

- **Загрузка данных с сервера** → `componentDidMount`
- **Подписка на события / таймеры** → `componentDidMount`
- **Отписка / очистка** → `componentWillUnmount`
- **Вычисление state из props** → `static getDerivedStateFromProps`
- **Чтение DOM перед обновлением** (например, позиция скролла) → `getSnapshotBeforeUpdate`
- **Оптимизация** → `shouldComponentUpdate` (возвращай `false`, чтобы пропустить ненужную перерисовку)

### Обработка ошибок: componentDidCatch

```jsx
class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(err, errorInfo) {
    console.error(err);
    this.setState({ error: err, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>Что-то пошло не так</h2>
          <details>{this.state.errorInfo.componentStack}</details>
        </div>
      );
    }
    return <ChildComponent />;
  }
}
```

Если дочерний компонент выбрасывает ошибку в `render`, `constructor` или lifecycle — React вызовет `componentDidCatch` в ближайшем родителе, который его реализует. Это **границы ошибок** (error boundaries).

---

## 10. Практика: собираем приложение Letters Social

### Подготовка

```bash
git clone git@github.com:react-in-action/letters-social.git
cd letters-social
git checkout chapter-4
npm install
npm run db:seed
npm run dev
```

Приложение доступно на `http://localhost:3000`, API — на `http://localhost:3500`.

### Шаг 1. Точка входа (src/index.js)

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

createRoot(document.getElementById('app')).render(<App />);
```

### Шаг 2. Компонент App (src/app.js)

```jsx
import { Component } from 'react';
import PropTypes from 'prop-types';
import parseLinkHeader from 'parse-link-header';
import orderBy from 'lodash/orderBy';
import * as API from './shared/http';
import Post from './components/post/Post';
import Navbar from './components/nav/navbar';
import Welcome from './components/welcome/Welcome';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      loading: false,
      posts: [],
      endpoint: `${process.env.ENDPOINT}/posts?_page=1&_sort=date&_order=DESC&_embed=comments&_expand=user&_embed=likes`,
    };
    this.getPosts = this.getPosts.bind(this);
  }

  componentDidMount() {
    this.getPosts();
  }

  componentDidCatch(err, info) {
    console.error(err);
    this.setState({ error: err });
  }

  getPosts() {
    API.fetchPosts(this.state.endpoint)
      .then((res) =>
        res.json().then((posts) => {
          const links = parseLinkHeader(res.headers.get('Link'));
          this.setState(() => ({
            posts: orderBy(this.state.posts.concat(posts), 'date', 'desc'),
            endpoint: links.next.url,
          }));
        })
      )
      .catch((err) => this.setState({ error: err }));
  }

  render() {
    return (
      <div className="app">
        <Navbar />
        <div className="home">
          <Welcome />
          <div>
            {this.state.posts.length > 0 && (
              <div className="posts">
                {this.state.posts.map(({ id }) => (
                  <Post id={id} key={id} user={this.props.user} />
                ))}
              </div>
            )}
            <button className="block" onClick={this.getPosts}>
              Load more posts
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
```

### Шаг 3. Компонент Post (src/components/post/Post.js)

```jsx
import { Component } from 'react';
import PropTypes from 'prop-types';
import * as API from '../../shared/http';
import Content from './Content';
import Image from './Image';
import Link from './Link';
import UserHeader from './UserHeader';
import Comments from '../comment/Comments';
import Loader from '../Loader';

export class Post extends Component {
  static propTypes = {
    post: PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string,
      user: PropTypes.object,
      comments: PropTypes.array,
      image: PropTypes.string,
      likes: PropTypes.array,
      location: PropTypes.object,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      post: null,
      comments: [],
      showComments: false,
    };
    this.loadPost = this.loadPost.bind(this);
  }

  componentDidMount() {
    this.loadPost(this.props.id);
  }

  loadPost(id) {
    API.fetchPost(id)
      .then((res) => res.json())
      .then((post) => this.setState({ post }));
  }

  render() {
    if (!this.state.post) return <Loader />;
    return (
      <div className="post">
        <UserHeader date={this.state.post.date} user={this.state.post.user} />
        <Content post={this.state.post} />
        <Image post={this.state.post} />
        <Link link={this.state.post.link} />
        <Comments
          comments={this.state.comments}
          show={this.state.showComments}
          post={this.state.post}
          user={this.props.user}
        />
      </div>
    );
  }
}

export default Post;
```

### Что мы построили

- `App` загружает список постов при монтировании (`componentDidMount` → `getPosts`).
- Каждый `Post` загружает свои данные отдельным запросом.
- Кнопка «Load more» запрашивает следующую страницу постов (пагинация через Link-заголовки).
- `componentDidCatch` ловит ошибки и показывает сообщение вместо падения всего приложения.

---

## 11. Формы в React

### Задача

Создать компонент `CreatePost` — форму для создания постов.

### Шаг 1. Базовая форма

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
      valid: false,
    };
    this.handlePostChange = this.handlePostChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlePostChange(event) {
    const content = event.target.value;
    this.setState(() => ({
      content,
      valid: content.length <= 280,
    }));
  }

  handleSubmit() {
    if (!this.state.valid) return;
    const newPost = {
      date: Date.now(),
      id: Date.now(),
      content: this.state.content,
    };
    this.props.onSubmit(newPost);
    this.setState({ content: '', valid: false });
  }

  render() {
    return (
      <div className="create-post">
        <button onClick={this.handleSubmit}>Post</button>
        <textarea
          value={this.state.content}
          onChange={this.handlePostChange}
          placeholder="What's on your mind?"
        />
      </div>
    );
  }
}

export default CreatePost;
```

### Шаг 2. Подключаем в App

```jsx
import CreatePost from './components/post/Create';

// В конструкторе App:
this.createNewPost = this.createNewPost.bind(this);

// Метод:
createNewPost(post) {
  return API.createPost(post)
    .then((res) => res.json())
    .then((newPost) => {
      this.setState((prevState) => ({
        posts: orderBy(prevState.posts.concat(newPost), 'date', 'desc'),
      }));
    })
    .catch((err) => this.setState({ error: err }));
}

// В render:
<CreatePost onSubmit={this.createNewPost} />
```

### Controlled vs Uncontrolled компоненты

**Controlled (контролируемый):**
```jsx
<textarea value={this.state.content} onChange={this.handleChange} />
```
— React полностью контролирует значение. Каждое нажатие клавиши → `onChange` → `setState` → новый `render`.

**Uncontrolled (неконтролируемый):**
```jsx
<textarea onChange={this.handleChange} />
```
— Элемент хранит своё значение сам. React не контролирует его содержимое.

> **Рекомендация:** используй **controlled** компоненты. Это даёт полный контроль над данными, валидацией и поведением формы.

### Валидация и санитизация

Для фильтрации нецензурной лексики установи пакет `bad-words`:

```bash
npm install bad-words
```

```jsx
import Filter from 'bad-words';

const filter = new Filter();

handlePostChange(event) {
  const content = filter.clean(event.target.value);
  this.setState(() => ({
    content,
    valid: content.length > 0 && content.length <= 280,
  }));
}
```

- **Валидация** — проверяем, что данные соответствуют правилам (длина, формат).
- **Санитизация** — очищаем данные перед сохранением (фильтр нецензурной лексики, trim пробелов и т.д.).

---

## 12. Интеграция сторонних библиотек и refs

### Задача

Добавить карты Mapbox к постам. Научиться работать с DOM через `ref`.

### Что такое ref

`ref` — это способ получить ссылку на настоящий DOM-элемент из React-компонента:

```jsx
<div ref={(node) => { this.mapNode = node; }} />
```

После рендера `this.mapNode` — это обычный DOM-элемент. Используй его, когда стороннй библиотеке нужен DOM.

### Когда использовать ref

- Работа со сторонними библиотеками (Mapbox, D3, jQuery-плагины)
- Управление фокусом, выделением текста
- Императивное управление анимациями
- Работа с `<video>` / `<audio>`

### Шаг 1. Компонент DisplayMap

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class DisplayMap extends Component {
  static propTypes = {
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
      name: PropTypes.string,
    }),
    displayOnly: PropTypes.bool,
  };

  static defaultProps = {
    displayOnly: true,
    location: { lat: 34.1535641, lng: -118.1428115, name: null },
  };

  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
      location: {
        lat: props.location.lat,
        lng: props.location.lng,
        name: props.location.name,
      },
    };
    this.ensureMapExists = this.ensureMapExists.bind(this);
    this.updateMapPosition = this.updateMapPosition.bind(this);
  }

  componentDidMount() {
    this.L = window.L; // Leaflet (загружен через <script>)
    if (this.state.location.lng && this.state.location.lat) {
      this.ensureMapExists();
    }
  }

  componentDidUpdate() {
    if (this.map && !this.props.displayOnly) {
      this.map.invalidateSize(false);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location) {
      const locationsAreEqual = Object.keys(this.props.location).every(
        (k) => this.props.location[k] === prevProps.location[k]
      );
      if (!locationsAreEqual) {
        this.updateMapPosition(this.props.location);
      }
    }
  }

  ensureMapExists() {
    if (this.state.mapLoaded) return;
    this.map = this.L.mapbox.map(this.mapNode, 'mapbox.streets', {
      zoomControl: false,
      scrollWheelZoom: false,
    });
    this.map.setView(
      this.L.latLng(this.state.location.lat, this.state.location.lng),
      12
    );
    this.addMarker(this.state.location.lat, this.state.location.lng);
    this.setState({ mapLoaded: true });
  }

  updateMapPosition(location) {
    const { lat, lng } = location;
    this.map.setView(this.L.latLng(lat, lng));
    this.addMarker(lat, lng);
    this.setState({ location });
  }

  addMarker(lat, lng) {
    if (this.marker) {
      return this.marker.setLatLng(this.L.latLng(lat, lng));
    }
    this.marker = this.L.marker([lat, lng], {
      icon: this.L.mapbox.marker.icon({ 'marker-color': '#4469af' }),
    });
    this.marker.addTo(this.map);
  }

  render() {
    return (
      <div className="displayMap">
        <div className="map" ref={(node) => { this.mapNode = node; }}>
          {!this.state.mapLoaded && (
            <img
              className="map"
              src={`https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/${this.state.location.lat},${this.state.location.lng},12,0,0/600x175?access_token=${process.env.MAPBOX_API_TOKEN}`}
              alt={this.state.location.name}
            />
          )}
        </div>
        {this.props.displayOnly && this.state.location.name && (
          <div className="location-description">
            <i className="location-icon fa fa-location-arrow" />
            <span>{this.state.location.name}</span>
          </div>
        )}
      </div>
    );
  }
}
```

### Что здесь происходит

1. В `render` мы используем `ref` чтобы сохранить ссылку на DOM-узел (`this.mapNode`).
2. В `componentDidMount` (когда DOM уже готов) — создаём карту Mapbox, передавая ей этот DOM-узел.
3. При обновлении props — обновляем позицию карты.
4. Пока карта загружается — показываем статичное изображение (fallback).

**Паттерн интеграции со сторонними библиотеками:**
- `componentDidMount` → инициализация библиотеки
- `componentDidUpdate` → обновление при новых данных (сравнивайте `prevProps` с `this.props`)
- `componentWillUnmount` → очистка (удаление обработчиков, destroy)

### Шаг 2. Компонент LocationTypeAhead

Компонент для поиска локаций с использованием Mapbox API и браузерного Geolocation. Установи пакет `mapbox`:

```bash
npm install mapbox
```

```jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapBox from 'mapbox';

export default class LocationTypeAhead extends Component {
  static propTypes = {
    onLocationUpdate: PropTypes.func.isRequired,
    onLocationSelect: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { text: '', locations: [], selectedLocation: null };
    this.mapbox = new MapBox(process.env.MAPBOX_API_TOKEN);
    this.attemptGeoLocation = this.attemptGeoLocation.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSelectLocation = this.handleSelectLocation.bind(this);
    this.handleLocationUpdate = this.handleLocationUpdate.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
  }

  componentWillUnmount() {
    this.resetSearch();
  }

  handleSearchChange(e) {
    const text = e.target.value;
    this.setState({ text });
    if (!text) return;
    this.mapbox.geocodeForward(text, {}).then((loc) => {
      if (!loc.entity.features || !loc.entity.features.length) return;
      const locations = loc.entity.features.map((feature) => {
        const [lng, lat] = feature.center;
        return { name: feature.place_name, lat, lng };
      });
      this.setState({ locations });
    });
  }

  handleLocationUpdate(location) {
    this.setState({ text: location.name, locations: [], selectedLocation: location });
    this.props.onLocationUpdate(location);
  }

  handleSelectLocation() {
    this.props.onLocationSelect(this.state.selectedLocation);
  }

  attemptGeoLocation() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        this.mapbox.geocodeReverse({ latitude, longitude }, {}).then((loc) => {
          if (!loc.entity.features || !loc.entity.features.length) return;
          const feature = loc.entity.features[0];
          const [lng, lat] = feature.center;
          const currentLocation = { name: feature.place_name, lat, lng };
          this.setState({
            locations: [currentLocation],
            selectedLocation: currentLocation,
            text: currentLocation.name,
          });
          this.handleLocationUpdate(currentLocation);
        });
      },
      null,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  resetSearch() {
    this.setState({ text: '', locations: [], selectedLocation: null });
  }

  render() {
    return (
      <div>
        <div className="location-typeahead">
          <i className="fa fa-location-arrow" onClick={this.attemptGeoLocation} />
          <input
            onChange={this.handleSearchChange}
            type="text"
            placeholder="Enter a location..."
            value={this.state.text}
          />
          <button
            disabled={!this.state.selectedLocation}
            onClick={this.handleSelectLocation}
          >
            Select
          </button>
        </div>
        {this.state.text.length > 0 && this.state.locations.length > 0 && (
          <div className="location-typeahead-results">
            {this.state.locations.map((location) => (
              <div
                key={location.name}
                className="result"
                onClick={(e) => {
                  e.preventDefault();
                  this.handleLocationUpdate(location);
                }}
              >
                {location.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
```

### Шаг 3. Собираем всё в CreatePost

```jsx
import DisplayMap from '../map/DisplayMap';
import LocationTypeAhead from '../map/LocationTypeAhead';

// В state добавляем:
this.state = {
  content: '',
  valid: false,
  showLocationPicker: false,
  location: { lat: 34.1535641, lng: -118.1428115, name: null },
  locationSelected: false,
};

// Новые методы:
onLocationUpdate(location) {
  this.setState({ location });
}

onLocationSelect(location) {
  this.setState({ location, showLocationPicker: false, locationSelected: true });
}

handleToggleLocation(e) {
  e.preventDefault();
  this.setState((state) => ({ showLocationPicker: !state.showLocationPicker }));
}

handleRemoveLocation() {
  this.setState({ locationSelected: false, location: this.initialState.location });
}

// В handleSubmit добавляем локацию:
handleSubmit() {
  if (!this.state.valid) return;
  const newPost = { date: Date.now(), id: Date.now(), content: this.state.content };
  if (this.state.locationSelected) {
    newPost.location = this.state.location;
  }
  this.props.onSubmit(newPost);
  this.setState({ content: '', valid: false, showLocationPicker: false, locationSelected: false });
}

// В render:
render() {
  return (
    <div className="create-post">
      <textarea
        value={this.state.content}
        onChange={this.handlePostChange}
        placeholder="What's on your mind?"
      />
      <div className="controls">
        <button onClick={this.handleSubmit}>Post</button>
        <button onClick={this.handleToggleLocation}>
          {this.state.showLocationPicker ? 'Cancel' : 'Add location'}
        </button>
      </div>
      {this.state.showLocationPicker && !this.state.locationSelected && (
        <div className="location-picker">
          <LocationTypeAhead
            onLocationSelect={this.onLocationSelect}
            onLocationUpdate={this.onLocationUpdate}
          />
          <DisplayMap
            displayOnly={false}
            location={this.state.location}
          />
        </div>
      )}
    </div>
  );
}
```

### И в Post.js показываем карту

```jsx
import DisplayMap from '../map/DisplayMap';

// В render Post:
{this.state.post.location && <DisplayMap location={this.state.post.location} />}
```

---

## Итоговая шпаргалка

### Главные концепции

| Концепция | Описание |
|-----------|----------|
| **Компонент** | Независимый блок UI. Класс с `render()` или функция. |
| **Props** | Входные данные (read-only). Передаются от родителя. |
| **State** | Внутренние изменяемые данные. Только через `setState`. |
| **JSX** | HTML-подобный синтаксис. Компилятор автоматически преобразует в вызовы React (JSX Transform). |
| **Lifecycle** | Методы класса: mounting → updating → unmounting. В React 19 удалены `componentWill*` методы. |
| **Ref** | Прямой доступ к DOM-элементу. Для сторонних библиотек. |
| **Controlled** | Значение элемента формы контролируется через state. |
| **Children** | Вложенные элементы доступны через `this.props.children`. |

### Поток данных

```
Родитель (state) → props → Ребёнок
Ребёнок → callback(data) → Родитель → setState → re-render
```

### Частые ошибки

1. Прямое изменение `this.state` — используй `setState`.
2. Забыл `bind(this)` для методов класса → `this` будет `undefined`.
3. `setState` в `render()` → бесконечный цикл.
4. Забыл `key` при `.map()` → предупреждение + проблемы с производительностью.
5. Shallow merge в `setState` — вложенные объекты перезаписываются целиком.
6. `className` вместо `class`, `htmlFor` вместо `for`.
