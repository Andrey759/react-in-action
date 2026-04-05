# React на практике — Часть 3

> Практическое руководство по книге «React In Action» (Thomas M.T.)
> Философия: учимся делая. Минимум теории — максимум кода.
>
> **Примечание.** Redux в книге подаётся в «классическом» стиле (actions + reducers + connect). В современных проектах используют **Redux Toolkit** и хуки (`useSelector`, `useDispatch`). Мы сначала освоим классику (чтобы понимать чужой код), а в конце каждого раздела покажем современный эквивалент.

---

## Содержание

1. [Что такое Redux и зачем он нужен](#1-что-такое-redux-и-зачем-он-нужен)
2. [Action Types — словарь событий приложения](#2-action-types--словарь-событий-приложения)
3. [Action Creators — функции, создающие экшены](#3-action-creators--функции-создающие-экшены)
4. [Store — единое хранилище состояния](#4-store--единое-хранилище-состояния)
5. [Dispatch — отправляем экшены в store](#5-dispatch--отправляем-экшены-в-store)
6. [Асинхронные экшены и redux-thunk](#6-асинхронные-экшены-и-redux-thunk)
7. [Свой middleware — crash-репортинг](#7-свой-middleware--crash-репортинг)
8. [Тестирование экшенов](#8-тестирование-экшенов)
9. [Reducers — вычисляем новое состояние](#9-reducers--вычисляем-новое-состояние)
10. [Начальное состояние (Initial State)](#10-начальное-состояние-initial-state)
11. [Пишем редьюсеры для приложения](#11-пишем-редьюсеры-для-приложения)
12. [Комбинируем редьюсеры (combineReducers)](#12-комбинируем-редьюсеры-combinereducers)
13. [Тестирование редьюсеров](#13-тестирование-редьюсеров)
14. [Подключаем Redux к React — Provider и connect](#14-подключаем-redux-к-react--provider-и-connect)
15. [mapStateToProps — данные из store в props](#15-mapstatetoprops--данные-из-store-в-props)
16. [mapDispatchToProps — экшены в props](#16-mapdispatchtoprops--экшены-в-props)
17. [Тесты для подключённых компонентов](#17-тесты-для-подключённых-компонентов)
18. [Серверный рендеринг (SSR) — зачем и когда](#18-серверный-рендеринг-ssr--зачем-и-когда)
19. [Первый рендер на сервере (renderToString)](#19-первый-рендер-на-сервере-rendertostring)
20. [Переходим на React Router](#20-переходим-на-react-router)
21. [SSR с данными — Redux на сервере](#21-ssr-с-данными--redux-на-сервере)
22. [Современный Redux: Redux Toolkit и хуки](#22-современный-redux-redux-toolkit-и-хуки)

---

## 1. Что такое Redux и зачем он нужен

### Задача

Понять ключевую проблему, которую решает Redux, и запомнить его четыре основных элемента.

### Проблема

Когда приложение растёт, состояние начинает «расползаться» по десяткам компонентов. Один компонент хранит данные пользователя, другой — список постов, третий — флаг загрузки. Отладить такое приложение сложно: непонятно, где именно живёт состояние и кто его меняет.

### Решение — единый поток данных

Redux предлагает простую модель:

```
Событие (click, fetch, ...) 
  → Action (объект: «что произошло»)
    → Reducer (функция: «как изменить состояние»)
      → Store (единое хранилище)
        → React-компоненты получают новые props
```

Четыре ключевых элемента:

| Элемент | Что это | Аналогия |
|---------|---------|----------|
| **Action** | Обычный JS-объект с полем `type` | Записка: «Пользователь залогинился» |
| **Reducer** | Чистая функция `(state, action) → newState` | Бухгалтер: получил записку → обновил книгу |
| **Store** | Единый объект, хранящий всё состояние | Книга учёта — одна на всё приложение |
| **Middleware** | Функция-перехватчик между dispatch и reducer | Секретарь: обрабатывает записку «по пути» |

> **Главное правило:** состояние меняется только через dispatch(action) → reducer. Напрямую менять store нельзя.

---

## 2. Action Types — словарь событий приложения

### Задача

Создать файл констант, описывающий все возможные события в приложении.

### Шаг 1. Создаём файл типов

Типы — это строки. Их выносят в отдельный файл, чтобы не было опечаток и дублирования.

**src/constants/types.js:**
```js
export const app = {
  ERROR: 'app/error',
  LOADED: 'app/loaded',
  LOADING: 'app/loading',
};

export const auth = {
  LOGIN_SUCCESS: 'auth/login/success',
  LOGOUT_SUCCESS: 'auth/logout/success',
};

export const posts = {
  CREATE: 'post/create',
  GET: 'post/get',
  LIKE: 'post/like',
  UNLIKE: 'post/unlike',
  NEXT: 'post/paginate/next',
  UPDATE_LINKS: 'post/paginate/update',
};

export const comments = {
  CREATE: 'comments/create',
  GET: 'comments/get',
  SHOW: 'comments/show',
  TOGGLE: 'comments/toggle',
};
```

### Что мы сделали

Мы определили полный «словарь» событий приложения. Каждое событие — уникальная строка. Формат `область/действие` удобен для чтения в Redux DevTools. Группировка по объектам (`app`, `auth`, `posts`, `comments`) позволяет использовать короткие имена внутри (`GET`, `CREATE`) без конфликтов.

---

## 3. Action Creators — функции, создающие экшены

### Задача

Написать функции, которые возвращают объекты-экшены. Это единственный способ инициировать изменение состояния в Redux.

### Шаг 1. Простые (синхронные) action creators

**src/actions/loading.js:**
```js
import * as types from '../constants/types';

export function loading() {
  return { type: types.app.LOADING };
}

export function loaded() {
  return { type: types.app.LOADED };
}
```

**src/actions/error.js:**
```js
import * as types from '../constants/types';

export function createError(error, info) {
  return {
    type: types.app.ERROR,
    error,
    info,
  };
}
```

### Шаг 2. Action creators для комментариев

**src/actions/comments.js:**
```js
import * as types from '../constants/types';
import * as API from '../shared/http';
import { createError } from './error';

// Синхронные
export function showComments(postId) {
  return { type: types.comments.SHOW, postId };
}

export function toggleComments(postId) {
  return { type: types.comments.TOGGLE, postId };
}

export function updateAvailableComments(comments) {
  return { type: types.comments.GET, comments };
}

// Асинхронные (возвращают функцию — об этом в разделе 6)
export function createComment(payload) {
  return (dispatch) => {
    return API.createComment(payload)
      .then((res) => res.json())
      .then((comment) => {
        dispatch({ type: types.comments.CREATE, comment });
      })
      .catch((err) => dispatch(createError(err)));
  };
}

export function getCommentsForPost(postId) {
  return (dispatch) => {
    return API.fetchCommentsForPost(postId)
      .then((res) => res.json())
      .then((comments) => dispatch(updateAvailableComments(comments)))
      .catch((err) => dispatch(createError(err)));
  };
}
```

### Что мы сделали

- **Синхронный** action creator — просто возвращает объект `{ type, ...data }`.
- **Асинхронный** action creator — возвращает функцию, которая принимает `dispatch`. Внутри можно делать API-запросы и диспатчить несколько экшенов. Это работает благодаря `redux-thunk` (раздел 6).

---

## 4. Store — единое хранилище состояния

### Задача

Создать Redux store — единый объект, который хранит всё состояние приложения.

### Шаг 1. Заготовка корневого редьюсера

Store не может существовать без редьюсера. Пока создадим пустую заготовку:

**src/reducers/root.js:**
```js
import { combineReducers } from 'redux';

const rootReducer = combineReducers({});

export default rootReducer;
```

### Шаг 2. Файлы конфигурации store

**src/store/configureStore.js** (точка входа):
```js
import prodStore from './configureStore.prod';
import devStore from './configureStore.dev';

const isProd = process.env.NODE_ENV === 'production';
export default isProd ? prodStore : devStore;
```

**src/store/configureStore.prod.js:**
```js
import { createStore } from 'redux';
import rootReducer from '../reducers/root';

let store;

export default function configureStore(initialState) {
  if (store) return store;
  store = createStore(rootReducer, initialState);
  return store;
}
```

**src/store/configureStore.dev.js:**
```js
import { createStore, compose } from 'redux';
import rootReducer from '../reducers/root';

let store;

export default function configureStore(initialState) {
  if (store) return store;

  const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : (f) => f;

  store = createStore(rootReducer, initialState, compose(devTools));
  return store;
}
```

### Что мы сделали

- `createStore(reducer, initialState, enhancer)` — создаёт store.
- В dev-режиме подключаем Redux DevTools — расширение для Chrome/Firefox, которое показывает каждое изменение состояния.
- Паттерн `let store; if (store) return store;` — гарантирует, что в приложении всегда один store (синглтон).

> **Установка Redux DevTools:** поставь расширение для браузера: [https://github.com/zalmoxisus/redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension). После этого ты сможешь просматривать, перематывать и воспроизводить каждое изменение состояния.

---

## 5. Dispatch — отправляем экшены в store

### Задача

Отправить первые экшены в store и увидеть их в Redux DevTools.

### Шаг 1. Пробуем dispatch

Создай временный файл для эксперимента:

**src/store/exampleUse.js:**
```js
import configureStore from './configureStore';
import { loading, loaded } from '../actions/loading';

const store = configureStore();

store.dispatch(loading());
console.log(store.getState()); // { loading: true, ... }

store.dispatch(loaded());
console.log(store.getState()); // { loading: false, ... }
```

### Шаг 2. Импортируем в index.js чтобы увидеть результат

```js
// src/index.js (добавь в начало)
import './store/exampleUse';
```

Открой приложение и Redux DevTools — ты увидишь два экшена в таймлайне: `app/loading` и `app/loaded`.

### Что мы сделали

- `store.dispatch(action)` — единственный способ отправить экшен в store.
- `store.getState()` — возвращает текущее состояние.
- Пока у нас нет редьюсеров, которые обрабатывают эти экшены, состояние не меняется. Это нормально — мы добавим их в разделе 9.

> Этот файл был нужен только для демонстрации. Удали импорт `exampleUse` после эксперимента.

---

## 6. Асинхронные экшены и redux-thunk

### Задача

Научить Redux обрабатывать асинхронные операции (API-запросы, таймеры и пр.).

### Проблема

Redux по умолчанию принимает только простые объекты. Но тебе нужно:
1. Показать спиннер загрузки → `dispatch(loading())`
2. Сделать fetch-запрос → дождаться ответа
3. Убрать спиннер и показать данные → `dispatch(loaded())`, `dispatch(updatePosts(data))`

Для этого нужна библиотека **redux-thunk**.

### Шаг 1. Устанавливаем зависимости

```bash
npm install redux redux-thunk
```

### Шаг 2. Подключаем thunk как middleware

**src/store/configureStore.dev.js (обновлённый):**
```js
import thunk from 'redux-thunk';
import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from '../reducers/root';

let store;

export default function configureStore(initialState) {
  if (store) return store;

  const devTools = window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : (f) => f;

  store = createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(thunk), devTools)
  );
  return store;
}
```

**src/store/configureStore.prod.js (обновлённый):**
```js
import thunk from 'redux-thunk';
import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from '../reducers/root';

let store;

export default function configureStore(initialState) {
  if (store) return store;
  store = createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(thunk))
  );
  return store;
}
```

### Шаг 3. Пишем асинхронные action creators для постов

**src/actions/posts.js:**
```js
import parseLinkHeader from 'parse-link-header';
import * as types from '../constants/types';
import * as API from '../shared/http';
import { createError } from './error';
import { getCommentsForPost } from './comments';

// Синхронные
export function updateAvailablePosts(posts) {
  return { type: types.posts.GET, posts };
}

export function updatePaginationLinks(links) {
  return { type: types.posts.UPDATE_LINKS, links };
}

// Асинхронные — возвращают функцию вместо объекта
export function like(postId) {
  return (dispatch, getState) => {
    const { user } = getState();
    return API.likePost(postId, user.id)
      .then((res) => res.json())
      .then((post) => dispatch({ type: types.posts.LIKE, post }))
      .catch((err) => dispatch(createError(err)));
  };
}

export function unlike(postId) {
  return (dispatch, getState) => {
    const { user } = getState();
    return API.unlikePost(postId, user.id)
      .then((res) => res.json())
      .then((post) => dispatch({ type: types.posts.UNLIKE, post }))
      .catch((err) => dispatch(createError(err)));
  };
}

export function createNewPost(post) {
  return (dispatch, getState) => {
    const { user } = getState();
    post.userId = user.id;
    return API.createPost(post)
      .then((res) => res.json())
      .then((newPost) => dispatch({ type: types.posts.CREATE, post: newPost }))
      .catch((err) => dispatch(createError(err)));
  };
}

export function getPostsForPage(page = 'first') {
  return (dispatch, getState) => {
    const { pagination } = getState();
    const endpoint = pagination[page];
    return API.fetchPosts(endpoint)
      .then((res) => {
        const links = parseLinkHeader(res.headers.get('Link'));
        return res.json().then((posts) => {
          dispatch(updatePaginationLinks(links));
          dispatch(updateAvailablePosts(posts));
        });
      })
      .catch((err) => dispatch(createError(err)));
  };
}

export function loadPost(postId) {
  return (dispatch) => {
    return API.fetchPost(postId)
      .then((res) => res.json())
      .then((post) => {
        dispatch(updateAvailablePosts([post]));
        dispatch(getCommentsForPost(postId));
      })
      .catch((err) => dispatch(createError(err)));
  };
}
```

### Шаг 4. Action creators для аутентификации (async/await)

**src/actions/auth.js:**
```js
import * as types from '../constants/types';
import * as API from '../shared/http';
import { history } from '../history';
import { createError } from './error';
import { loading, loaded } from './loading';
import {
  getFirebaseUser,
  loginWithGithub,
  logUserOut,
  getFirebaseToken,
} from '../backend/auth';

export function loginSuccess(user, token) {
  return { type: types.auth.LOGIN_SUCCESS, user, token };
}

export function logoutSuccess() {
  return { type: types.auth.LOGOUT_SUCCESS };
}

export function logout() {
  return (dispatch) => {
    return logUserOut()
      .then(() => {
        history.push('/login');
        dispatch(logoutSuccess());
      })
      .catch((err) => dispatch(createError(err)));
  };
}

export function login() {
  return (dispatch) => {
    return loginWithGithub().then(async () => {
      try {
        dispatch(loading());
        const user = await getFirebaseUser();
        const token = await getFirebaseToken();
        const res = await API.loadUser(user.uid);

        if (res.status === 404) {
          const userPayload = {
            name: user.displayName,
            profilePicture: user.photoURL,
            id: user.uid,
          };
          const newUser = await API.createUser(userPayload).then((r) => r.json());
          dispatch(loginSuccess(newUser, token));
          dispatch(loaded());
          history.push('/');
          return newUser;
        }

        const existingUser = await res.json();
        dispatch(loginSuccess(existingUser, token));
        dispatch(loaded());
        history.push('/');
        return existingUser;
      } catch (err) {
        dispatch(createError(err));
      }
    });
  };
}
```

### Что мы сделали

**redux-thunk** учит store принимать **функции** помимо объектов. Когда store видит функцию, он вызывает её и передаёт два аргумента:
- `dispatch` — для отправки экшенов
- `getState` — для чтения текущего состояния

Типичный паттерн асинхронного action creator:
```js
export function fetchSomething() {
  return async (dispatch, getState) => {
    dispatch(loading());              // 1. Начинаем загрузку
    try {
      const data = await api.get();   // 2. Делаем запрос
      dispatch(success(data));        // 3. Успех → отправляем данные
    } catch (err) {
      dispatch(error(err));           // 4. Ошибка → отправляем ошибку
    } finally {
      dispatch(loaded());             // 5. Загрузка завершена
    }
  };
}
```

---

## 7. Свой middleware — crash-репортинг

### Задача

Написать middleware, который перехватывает ошибки и отправляет их в систему мониторинга (например, Sentry).

### Шаг 1. Создаём middleware

Redux middleware — это цепочка функций: `store → next → action → результат`.

**src/middleware/crash.js:**
```js
import { createError } from '../actions/error';

const crashReporting = (store) => (next) => (action) => {
  try {
    if (action.error) {
      console.error(action.error);
      console.error(action.info);
    }
    return next(action);
  } catch (err) {
    console.error('Redux middleware caught error:', err);
    return store.dispatch(createError(err));
  }
};

export default crashReporting;
```

### Шаг 2. Подключаем к store

```js
// src/store/configureStore.prod.js
import thunk from 'redux-thunk';
import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from '../reducers/root';
import crashReporting from '../middleware/crash';

let store;

export default function configureStore(initialState) {
  if (store) return store;
  store = createStore(
    rootReducer,
    initialState,
    compose(applyMiddleware(thunk, crashReporting))
  );
  return store;
}
```

### Что мы сделали

Middleware — это «перехватчик», который стоит между `dispatch` и `reducer`. Порядок важен: middleware вызываются слева направо в массиве `applyMiddleware(thunk, crashReporting)`.

Каждый middleware:
1. Получает `store` (для доступа к `getState` и `dispatch`)
2. Получает `next` — следующий middleware в цепочке (или reducer, если это последний)
3. Получает `action` — текущий экшен
4. Должен вызвать `next(action)` для продолжения цепочки

Типичные применения: логирование, аналитика, обработка ошибок, кеширование.

---

## 8. Тестирование экшенов

### Задача

Написать тесты для синхронных и асинхронных action creators.

### Шаг 1. Устанавливаем mock store

```bash
npm install --save-dev redux-mock-store
```

### Шаг 2. Тесты для синхронных экшенов

Синхронные экшены — обычные функции, возвращающие объекты. Тестировать просто.

### Шаг 3. Тесты для асинхронных экшенов

Для асинхронных экшенов нужен mock store с подключённым thunk:

**tests/actions/comments.test.js:**
```js
jest.mock('../../src/shared/http');

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import initialState from '../../src/constants/initialState';
import * as types from '../../src/constants/types';
import {
  showComments,
  toggleComments,
  updateAvailableComments,
  createComment,
  getCommentsForPost,
} from '../../src/actions/comments';
import * as API from '../../src/shared/http';

const mockStore = configureStore([thunk]);

describe('comment actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  // Синхронные — проверяем возвращённый объект
  test('showComments returns correct action', () => {
    expect(showComments('post-1')).toEqual({
      type: types.comments.SHOW,
      postId: 'post-1',
    });
  });

  test('toggleComments returns correct action', () => {
    expect(toggleComments('post-1')).toEqual({
      type: types.comments.TOGGLE,
      postId: 'post-1',
    });
  });

  // Асинхронные — проверяем какие экшены были задиспатчены
  test('createComment dispatches CREATE action', async () => {
    const mockComment = { content: 'great post!' };
    API.createComment = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([mockComment]),
      })
    );

    await store.dispatch(createComment(mockComment));

    const actions = store.getActions();
    expect(actions).toEqual([
      { type: types.comments.CREATE, comment: [mockComment] },
    ]);
  });

  test('getCommentsForPost dispatches GET action', async () => {
    const comments = [{ content: 'nice!' }];
    API.fetchCommentsForPost = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(comments),
      })
    );

    await store.dispatch(getCommentsForPost('post-1'));

    const actions = store.getActions();
    expect(actions).toEqual([
      { type: types.comments.GET, comments },
    ]);
  });
});
```

### Что мы сделали

- **Синхронные** экшены тестируем напрямую: вызвали функцию → проверили объект.
- **Асинхронные** — создаём mock store с `redux-thunk`, мокаем API-вызовы через `jest.fn()`, диспатчим экшен, потом проверяем `store.getActions()` — массив всех отправленных экшенов.

---

## 9. Reducers — вычисляем новое состояние

### Задача

Понять, что такое reducer, и написать первый.

### Правила редьюсеров

1. **Чистая функция:** `(state, action) → newState`. Один и тот же вход → один и тот же выход.
2. **Никаких побочных эффектов:** нельзя делать API-запросы, использовать `Date.now()`, `Math.random()`.
3. **Не мутировать state:** всегда создавать копию (`Object.assign`, spread `...`, `Array.from`).
4. **Обязательный `default`:** неизвестные экшены возвращают текущий state без изменений.

### Шаг 1. Простейший reducer — loading

**src/reducers/loading.js:**
```js
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function loading(state = initialState.loading, action) {
  switch (action.type) {
    case types.app.LOADING:
      return true;
    case types.app.LOADED:
      return false;
    default:
      return state;
  }
}
```

### Что мы сделали

Этот reducer управляет одним булевым значением. Когда приходит экшен `LOADING` — возвращает `true`. `LOADED` — `false`. Всё остальное игнорирует. Это самый простой пример: reducer = switch по типу экшена.

---

## 10. Начальное состояние (Initial State)

### Задача

Определить форму (shape) всего состояния приложения до того, как произойдут какие-либо действия.

### Шаг 1. Файл начального состояния

**src/constants/initialState.js:**
```js
export default {
  error: null,
  loading: false,
  postIds: [],
  posts: {},
  commentIds: [],
  comments: {},
  pagination: {
    first: `${process.env.ENDPOINT}/posts?_page=1&_sort=date&_order=DESC&_embed=comments&_expand=user&_embed=likes`,
    next: null,
    prev: null,
    last: null,
  },
  user: {
    authenticated: false,
    profilePicture: null,
    id: null,
    name: null,
    token: null,
  },
};
```

### Что мы сделали

Мы спроектировали **форму** store. Обрати внимание на подход:
- **ID хранятся отдельно** (`postIds`, `commentIds`) от данных (`posts`, `comments`).
- Посты и комментарии хранятся как **объекты** (ключ = id), а не массивы. Это даёт O(1) доступ по id: `state.posts['abc123']`.
- Пагинация хранит ссылки на страницы API.

Это называется **нормализация** данных — стандартный подход в Redux.

---

## 11. Пишем редьюсеры для приложения

### Задача

Создать редьюсеры для комментариев, постов, ошибок, пагинации и пользователя.

### Шаг 1. Reducer для комментариев

**src/reducers/comments.js:**
```js
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function comments(state = initialState.comments, action) {
  switch (action.type) {
    case types.comments.GET: {
      const nextState = { ...state };
      for (const comment of action.comments) {
        if (!nextState[comment.id]) {
          nextState[comment.id] = comment;
        }
      }
      return nextState;
    }
    case types.comments.CREATE: {
      const { comment } = action;
      return { ...state, [comment.id]: comment };
    }
    default:
      return state;
  }
}

export function commentIds(state = initialState.commentIds, action) {
  switch (action.type) {
    case types.comments.GET: {
      const nextIds = action.comments.map((c) => c.id);
      const nextState = [...state];
      for (const id of nextIds) {
        if (!state.includes(id)) {
          nextState.push(id);
        }
      }
      return nextState;
    }
    case types.comments.CREATE: {
      return [...state, action.comment.id];
    }
    default:
      return state;
  }
}
```

### Шаг 2. Reducer для постов

**src/reducers/posts.js:**
```js
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function posts(state = initialState.posts, action) {
  switch (action.type) {
    case types.posts.GET: {
      const nextState = { ...state };
      for (const post of action.posts) {
        if (!nextState[post.id]) {
          nextState[post.id] = post;
        }
      }
      return nextState;
    }
    case types.posts.CREATE: {
      const { post } = action;
      return { ...state, [post.id]: post };
    }
    case types.comments.SHOW: {
      return {
        ...state,
        [action.postId]: { ...state[action.postId], showComments: true },
      };
    }
    case types.comments.TOGGLE: {
      const current = state[action.postId];
      return {
        ...state,
        [action.postId]: { ...current, showComments: !current.showComments },
      };
    }
    case types.posts.LIKE:
    case types.posts.UNLIKE: {
      const oldPost = state[action.post.id];
      return {
        ...state,
        [action.post.id]: { ...oldPost, ...action.post },
      };
    }
    case types.comments.CREATE: {
      const { comment } = action;
      const post = state[comment.postId];
      return {
        ...state,
        [comment.postId]: {
          ...post,
          comments: [...post.comments, comment],
        },
      };
    }
    default:
      return state;
  }
}

export function postIds(state = initialState.postIds, action) {
  switch (action.type) {
    case types.posts.GET: {
      const nextIds = action.posts.map((p) => p.id);
      const nextState = [...state];
      for (const id of nextIds) {
        if (!state.includes(id)) {
          nextState.push(id);
        }
      }
      return nextState;
    }
    case types.posts.CREATE: {
      const { post } = action;
      if (state.includes(post.id)) return state;
      return [...state, post.id];
    }
    default:
      return state;
  }
}
```

### Шаг 3. Reducer для ошибок

**src/reducers/error.js:**
```js
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function error(state = initialState.error, action) {
  switch (action.type) {
    case types.app.ERROR:
      return action.error;
    default:
      return state;
  }
}
```

### Шаг 4. Reducer для пагинации

**src/reducers/pagination.js:**
```js
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function pagination(state = initialState.pagination, action) {
  switch (action.type) {
    case types.posts.UPDATE_LINKS: {
      const nextState = { ...state };
      for (const key in action.links) {
        if (action.links.hasOwnProperty(key)) {
          nextState[key] = action.links[key].url;
        }
      }
      return nextState;
    }
    default:
      return state;
  }
}
```

### Шаг 5. Reducer для пользователя

**src/reducers/user.js:**
```js
import Cookies from 'js-cookie';
import initialState from '../constants/initialState';
import * as types from '../constants/types';

export function user(state = initialState.user, action) {
  switch (action.type) {
    case types.auth.LOGIN_SUCCESS: {
      const { user, token } = action;
      Cookies.set('letters-token', token);
      return {
        ...state,
        authenticated: true,
        name: user.name,
        id: user.id,
        profilePicture: user.profilePicture || '/static/assets/users/4.jpeg',
        token,
      };
    }
    case types.auth.LOGOUT_SUCCESS:
      Cookies.remove('letters-token');
      return initialState.user;
    default:
      return state;
  }
}
```

### Что мы сделали

Каждый reducer отвечает за свой «кусочек» (slice) состояния:

| Reducer | Slice store | Типы экшенов |
|---------|-------------|-------------|
| `loading` | `boolean` | `LOADING`, `LOADED` |
| `error` | `Error \| null` | `ERROR` |
| `posts` | `{ [id]: post }` | `GET`, `CREATE`, `LIKE`, `UNLIKE`, `SHOW`, `TOGGLE`, `CREATE` (comment) |
| `postIds` | `string[]` | `GET`, `CREATE` |
| `comments` | `{ [id]: comment }` | `GET`, `CREATE` |
| `commentIds` | `string[]` | `GET`, `CREATE` |
| `pagination` | `{ first, next, prev, last }` | `UPDATE_LINKS` |
| `user` | `{ authenticated, name, id, ... }` | `LOGIN_SUCCESS`, `LOGOUT_SUCCESS` |

Обрати внимание: reducer для постов обрабатывает не только `posts.*` экшены, но и `comments.SHOW`, `comments.TOGGLE`, `comments.CREATE`. Reducer отвечает за свой кусок состояния, а не за «свой» тип экшенов.

---

## 12. Комбинируем редьюсеры (combineReducers)

### Задача

Объединить все редьюсеры в один корневой.

### Шаг 1. Обновляем root.js

**src/reducers/root.js:**
```js
import { combineReducers } from 'redux';
import { error } from './error';
import { loading } from './loading';
import { pagination } from './pagination';
import { posts, postIds } from './posts';
import { user } from './user';
import { comments, commentIds } from './comments';

const rootReducer = combineReducers({
  commentIds,
  comments,
  error,
  loading,
  pagination,
  postIds,
  posts,
  user,
});

export default rootReducer;
```

### Что мы сделали

`combineReducers` берёт объект, где ключ = имя поля в store, значение = reducer. Каждый reducer получает только свой кусок состояния и возвращает обновлённый кусок. Redux сам собирает результаты в единый объект.

Результирующий store выглядит так:
```js
{
  commentIds: [...],
  comments: {...},
  error: null,
  loading: false,
  pagination: {...},
  postIds: [...],
  posts: {...},
  user: {...}
}
```

---

## 13. Тестирование редьюсеров

### Задача

Написать тесты для редьюсеров. Поскольку редьюсеры — чистые функции, тестировать их просто: передал вход — проверил выход.

### Шаг 1. Тесты для user reducer

**tests/reducers/user.test.js:**
```js
jest.mock('js-cookie');

import { user } from '../../src/reducers/user';
import initialState from '../../src/constants/initialState';
import * as types from '../../src/constants/types';

describe('user reducer', () => {
  test('returns initial state by default', () => {
    expect(user(undefined, {})).toEqual(initialState.user);
  });

  test('handles LOGIN_SUCCESS', () => {
    const mockUser = { name: 'Alice', id: '42', profilePicture: 'pic.jpg' };
    const mockToken = 'abc-token';

    const result = user(initialState.user, {
      type: types.auth.LOGIN_SUCCESS,
      user: mockUser,
      token: mockToken,
    });

    expect(result).toEqual({
      authenticated: true,
      name: 'Alice',
      id: '42',
      profilePicture: 'pic.jpg',
      token: 'abc-token',
    });
  });

  test('handles LOGOUT_SUCCESS', () => {
    const loggedInState = {
      authenticated: true,
      name: 'Alice',
      id: '42',
      profilePicture: 'pic.jpg',
      token: 'abc-token',
    };

    const result = user(loggedInState, {
      type: types.auth.LOGOUT_SUCCESS,
    });

    expect(result).toEqual(initialState.user);
  });
});
```

### Что мы сделали

Паттерн теста reducer:
```js
expect(reducer(previousState, action)).toEqual(expectedState);
```

Три обязательных теста для каждого reducer:
1. Возвращает начальное состояние при `undefined` state и пустом экшене.
2. Правильно обрабатывает каждый тип экшена.
3. Возвращает текущий state при неизвестном экшене.

---

## 14. Подключаем Redux к React — Provider и connect

### Задача

Связать Redux store с деревом React-компонентов так, чтобы компоненты получали данные из store и могли отправлять экшены.

### Шаг 1. Устанавливаем react-redux

```bash
npm install react-redux
```

### Шаг 2. Оборачиваем приложение в Provider

`Provider` — компонент из `react-redux`, который делает store доступным всему дереву.

**src/index.js:**
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import initialReduxState from './constants/initialState';
import App from './app';

const store = configureStore(initialReduxState);

const root = createRoot(document.getElementById('app'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### Два типа компонентов

С Redux компоненты делятся на два типа:

| | Container (контейнер) | Presentational (презентационный) |
|---|---|---|
| **Откуда данные** | Из Redux store | Из props (от родителя) |
| **Может диспатчить** | Да | Нет (вызывает callback из props) |
| **Стили** | Обычно нет | Да |
| **Создаётся** | Через `connect()` | Вручную |

**Пример:** `Home` (контейнер) подключён к Redux, получает массив постов, передаёт каждый пост компоненту `Post` (презентационный) через props.

### Что мы сделали

- `<Provider store={store}>` оборачивает всё приложение и даёт дочерним компонентам доступ к Redux store через React context.
- Без Provider подключённые компоненты не смогут получить данные.

---

## 15. mapStateToProps — данные из store в props

### Задача

Подключить компонент к Redux store и получить данные из store как props.

### Шаг 1. Функция mapStateToProps

Эта функция принимает весь state и возвращает объект — данные, которые нужны компоненту:

### Шаг 2. Подключаем Home компонент

**src/pages/Home.js:**
```jsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import orderBy from 'lodash/orderBy';
import CreatePost from '../components/post/Create';
import Post from '../components/post/Post';
import Welcome from '../components/welcome/Welcome';

export class Home extends Component {
  render() {
    return (
      <div className="home">
        <Welcome />
        <div>
          <CreatePost />
          {this.props.posts && (
            <div className="posts">
              {this.props.posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </div>
          )}
          <button className="block">Load more posts</button>
        </div>
      </div>
    );
  }
}

export const mapStateToProps = (state) => {
  const posts = orderBy(
    state.postIds.map((id) => state.posts[id]),
    'date',
    'desc'
  );
  return { posts };
};

export default connect(mapStateToProps)(Home);
```

### Что мы сделали

1. **`mapStateToProps(state)`** — получает весь Redux store, возвращает только нужные данные. Здесь мы берём `postIds` и `posts`, собираем массив постов и сортируем по дате.

2. **`connect(mapStateToProps)(Home)`** — создаёт **контейнерный компонент** (higher-order component), который:
   - Подписывается на изменения store
   - Вызывает `mapStateToProps` при каждом обновлении
   - Передаёт результат как props в `Home`

3. Мы **экспортируем оба** варианта:
   - `export class Home` — для тестирования без Redux
   - `export default connect(...)` — для использования в приложении

---

## 16. mapDispatchToProps — экшены в props

### Задача

Дать компоненту возможность отправлять экшены в Redux store.

### Шаг 1. Обновляем Home с экшенами

**src/pages/Home.js (финальная версия):**
```jsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import orderBy from 'lodash/orderBy';
import { createError } from '../actions/error';
import { createNewPost, getPostsForPage } from '../actions/posts';
import { showComments } from '../actions/comments';
import CreatePost from '../components/post/Create';
import Post from '../components/post/Post';
import Welcome from '../components/welcome/Welcome';

export class Home extends Component {
  componentDidMount() {
    this.props.actions.getPostsForPage();
  }

  componentDidCatch(err, info) {
    this.props.actions.createError(err, info);
  }

  render() {
    return (
      <div className="home">
        <Welcome />
        <div>
          <CreatePost onSubmit={this.props.actions.createNewPost} />
          {this.props.posts && (
            <div className="posts">
              {this.props.posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  openCommentsDrawer={this.props.actions.showComments}
                />
              ))}
            </div>
          )}
          <button
            className="block"
            onClick={this.props.actions.getNextPageOfPosts}
          >
            Load more posts
          </button>
        </div>
      </div>
    );
  }
}

export const mapStateToProps = (state) => {
  const posts = orderBy(
    state.postIds.map((id) => state.posts[id]),
    'date',
    'desc'
  );
  return { posts };
};

export const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(
      {
        createNewPost,
        getPostsForPage,
        showComments,
        createError,
        getNextPageOfPosts: getPostsForPage.bind(null, 'next'),
      },
      dispatch
    ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
```

### Что мы сделали

1. **`mapDispatchToProps(dispatch)`** — получает функцию `dispatch` из store.

2. **`bindActionCreators(actionCreators, dispatch)`** — оборачивает каждый action creator в `dispatch(...)`. Без этого пришлось бы писать `dispatch(createNewPost(data))` вручную. С `bindActionCreators` достаточно `actions.createNewPost(data)`.

3. **Полный цикл данных** теперь работает:
```
componentDidMount
  → this.props.actions.getPostsForPage()
    → dispatch(async thunk)
      → API.fetchPosts()
        → dispatch({ type: 'post/get', posts })
          → reducer обновляет store
            → mapStateToProps пересчитывает props
              → компонент перерисовывается
```

### Другие подключённые компоненты

По той же схеме подключаются все остальные компоненты:
- **App** — получает `user`, `error`, `loading`
- **Comments** — получает комментарии к посту, экшены создания/переключения
- **Navigation** — получает `user`, экшен `logout`
- **Login** — получает экшен `login`
- **SinglePost** — получает один пост, загружает его в `componentDidMount`

Паттерн везде одинаков: `mapStateToProps` + `mapDispatchToProps` + `connect`.

---

## 17. Тесты для подключённых компонентов

### Задача

Протестировать `mapStateToProps`, `mapDispatchToProps` и рендеринг подключённого компонента.

**tests/pages/Home.test.js:**
```jsx
jest.mock('mapbox');

import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { Home, mapStateToProps, mapDispatchToProps } from '../../src/pages/Home';
import configureStore from '../../src/store/configureStore';
import initialState from '../../src/constants/initialState';

const now = Date.now();

describe('Home page', () => {
  const state = {
    ...initialState,
    posts: {
      '1': { content: 'Hello', likes: [], date: now },
      '2': { content: 'World', likes: [], date: now },
    },
    postIds: ['1', '2'],
  };

  const store = configureStore(state);

  test('mapStateToProps extracts sorted posts', () => {
    const result = mapStateToProps(state);
    expect(result.posts).toHaveLength(2);
    expect(result.posts[0]).toHaveProperty('content');
  });

  test('mapDispatchToProps provides all actions', () => {
    const mockDispatch = jest.fn();
    const result = mapDispatchToProps(mockDispatch);

    expect(result.actions.createNewPost).toBeDefined();
    expect(result.actions.getPostsForPage).toBeDefined();
    expect(result.actions.showComments).toBeDefined();
    expect(result.actions.createError).toBeDefined();
    expect(result.actions.getNextPageOfPosts).toBeDefined();
  });

  test('renders posts correctly', () => {
    const props = {
      posts: [
        { id: '1', content: 'Hello', likes: [], date: now },
        { id: '2', content: 'World', likes: [], date: now },
      ],
      actions: {
        getPostsForPage: jest.fn(),
        createNewPost: jest.fn(),
        createError: jest.fn(),
        showComments: jest.fn(),
      },
    };

    const tree = renderer
      .create(
        <Provider store={store}>
          <Home {...props} />
        </Provider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### Что мы сделали

Три уровня тестирования подключённого компонента:

1. **`mapStateToProps`** — вызываем с mock state, проверяем что возвращает правильные props.
2. **`mapDispatchToProps`** — вызываем с `jest.fn()`, проверяем что все экшены на месте.
3. **Рендеринг** — оборачиваем в `Provider`, передаём mock props (экшены = `jest.fn()`), делаем snapshot.

---

## 18. Серверный рендеринг (SSR) — зачем и когда

### Задача

Понять что такое SSR, когда он нужен, и когда от него лучше отказаться.

### Что такое SSR

**SSR (Server-Side Rendering)** — генерация HTML на сервере до отправки в браузер. Вместо пустой страницы, которая потом «оживает» через JavaScript, пользователь сразу получает готовый HTML.

```
Без SSR:  Сервер → <div id="app"></div> + bundle.js → Браузер рендерит всё
С SSR:    Сервер → <div id="app"><полный HTML></div> + bundle.js → Браузер «подхватывает»
```

### Когда SSR нужен

| Ситуация | Нужен SSR? | Почему |
|----------|-----------|--------|
| Блог / медиа-сайт | Да | SEO, быстрый первый контент |
| E-commerce | Да | SEO, быстрый показ товаров |
| Внутренний инструмент (типа Jira) | Скорее нет | Нет SEO, важнее интерактивность |
| Дашборд с большими таблицами | Нет | Большой payload замедлит загрузку |

### Ключевые термины

- **First Paint** — когда пользователь впервые видит контент. SSR ускоряет.
- **Time to Interactive (TTI)** — когда пользователь может взаимодействовать. SSR может замедлить (больше данных на первый запрос).
- **hydrate** — процесс, когда React «подключается» к уже существующему HTML, добавляя обработчики событий.

### API React для SSR

```js
import ReactDOMServer from 'react-dom/server';

// Возвращает HTML строку (синхронно)
ReactDOMServer.renderToString(element);

// Возвращает HTML без react-атрибутов (для статики)
ReactDOMServer.renderToStaticMarkup(element);

// Асинхронная версия через Node.js streams
ReactDOMServer.renderToNodeStream(element);
```

На клиенте вместо `render` используется `hydrate`:
```js
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('app'), <App />);
```

---

## 19. Первый рендер на сервере (renderToString)

### Задача

Настроить Express-сервер, который рендерит React-компоненты в HTML и отправляет браузеру.

### Шаг 1. Базовый сервер с Express

**server/server.js:**
```js
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const app = express();

app.use('*', (req, res) => {
  const html = ReactDOMServer.renderToString(
    React.createElement('div', null, `Rendered on server at ${new Date()}`)
  );

  res.send(`
    <!doctype html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000, () => console.log('Server on http://localhost:3000'));
```

### Шаг 2. Проверяем

```bash
node server/server.js
curl http://localhost:3000
```

Ответ содержит готовый HTML:
```html
<div id="app"><div data-reactroot="">Rendered on server at ...</div></div>
```

### Что мы сделали

1. `renderToString` принял React-элемент и вернул HTML-строку.
2. Мы вставили эту строку в `<div id="app">`.
3. Когда `bundle.js` загрузится, React вызовет `hydrate` и «подключится» к уже готовому HTML, не перерисовывая его с нуля.

---

## 20. Переходим на React Router

### Задача

Заменить самодельный роутер на React Router, чтобы маршрутизация работала и на сервере, и на клиенте.

### Шаг 1. Утилита проверки окружения

**src/utils/environment.js:**
```js
export function isServer() {
  return typeof window === 'undefined';
}
```

### Шаг 2. Определяем маршруты

**src/routes.js (React Router v3):**
```jsx
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './pages/app';
import Home from './pages/index';
import SinglePost from './pages/post';
import Login from './pages/login';
import NotFound from './pages/error';

export const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="posts/:postId" component={SinglePost} />
    <Route path="login" component={Login} />
    <Route path="*" component={NotFound} />
  </Route>
);
```

### Шаг 3. Клиентская точка входа

**src/index.js:**
```jsx
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import configureStore from './store/configureStore';
import initialReduxState from './constants/initialState';
import { routes } from './routes';

const store = configureStore(initialReduxState);

hydrateRoot(
  document.getElementById('app'),
  <Provider store={store}>
    <Router history={browserHistory} routes={routes} />
  </Provider>
);
```

### Шаг 4. Серверный рендеринг с React Router

**server/server.js:**
```js
import { renderToString } from 'react-dom/server';
import React from 'react';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from '../src/store/configureStore';
import initialReduxState from '../src/constants/initialState';
import { routes } from '../src/routes';

app.use('*', (req, res) => {
  match(
    { routes, location: req.originalUrl },
    (err, redirectLocation, renderProps) => {
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname);
      }

      const store = configureStore(initialReduxState);
      const appHtml = renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      );

      res.send(`
        <!doctype html>
        <html>
          <head>
            <link rel="stylesheet" href="/static/styles.css" />
            <meta charset="utf-8" />
          </head>
          <body>
            <div id="app">${appHtml}</div>
            <script src="/static/bundle.js"></script>
          </body>
        </html>
      `);
    }
  );
});
```

### Шаг 5. Защита маршрутов (onEnter hook)

**src/routes.js (с аутентификацией):**
```jsx
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './pages/app';
import Home from './pages/index';
import SinglePost from './pages/post';
import Login from './pages/login';
import NotFound from './pages/error';
import { isServer } from './utils/environment';
import { getFirebaseUser, getFirebaseToken } from './backend/auth';

async function requireUser(nextState, replace, callback) {
  if (isServer()) return callback();

  try {
    const firebaseUser = await getFirebaseUser();
    const firebaseToken = await getFirebaseToken();

    if (!firebaseUser || !firebaseToken) {
      if (nextState.location.pathname !== '/login') {
        replace({ pathname: '/login' });
      }
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
}

export const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Home} onEnter={requireUser} />
    <Route path="posts/:postId" component={SinglePost} onEnter={requireUser} />
    <Route path="login" component={Login} />
    <Route path="*" component={NotFound} />
  </Route>
);
```

### Что мы сделали

1. **`match()`** — серверная функция React Router, которая по URL находит нужный компонент.
2. **`RouterContext`** — рендерит найденный компонент на сервере.
3. **Один файл `routes.js`** используется и на клиенте, и на сервере — код переиспользуется.
4. **`onEnter`** — хук React Router, который вызывается при входе на маршрут. Мы используем его для проверки аутентификации. На сервере пропускаем проверку (`isServer()`), потому что у сервера нет Firebase-сессии.

### Обновляем history для навигации

**src/history/history.js:**
```js
import { browserHistory } from 'react-router';

const history =
  typeof window !== 'undefined' ? browserHistory : { push: () => {} };

const navigate = (to) => history.push(to);

export { history, navigate };
```

---

## 21. SSR с данными — Redux на сервере

### Задача

Рендерить приложение на сервере с реальными данными пользователя, а не с пустым состоянием.

### Шаг 1. Инициализируем Firebase на сервере

```js
// server/server.js
import * as firebase from 'firebase-admin';

firebase.initializeApp({
  credential: firebase.credential.cert(
    JSON.parse(process.env.LETTERS_FIREBASE_ADMIN_KEY)
  ),
  databaseURL: 'https://your-project.firebaseio.com',
});
```

### Шаг 2. Получаем данные пользователя из cookie

```js
app.use('*', async (req, res) => {
  match({ routes, location: req.originalUrl }, async (err, redirect, props) => {
    if (redirect) {
      return res.redirect(302, redirect.pathname);
    }

    // Создаём НОВЫЙ store для каждого запроса!
    const store = configureStore(initialReduxState);

    try {
      const token = req.cookies['letters-token'];

      if (token) {
        // Проверяем токен через Firebase Admin SDK
        const firebaseUser = await firebase.auth().verifyIdToken(token);
        const userResponse = await fetch(
          `${ENDPOINT}/users/${firebaseUser.uid}`
        );

        if (userResponse.status !== 404) {
          const user = await userResponse.json();
          await store.dispatch(loginSuccess(user, token));
          await store.dispatch(getPostsForPage());
        }
      }
    } catch (err) {
      if (err.errorInfo?.code === 'auth/argument-error') {
        res.clearCookie('letters-token');
      }
      store.dispatch(createError(err));
    }

    // Рендерим с обновлённым store
    const appHtml = renderToString(
      <Provider store={store}>
        <RouterContext {...props} />
      </Provider>
    );

    res.send(`
      <!doctype html>
      <html>
        <head><link rel="stylesheet" href="/static/styles.css" /></head>
        <body>
          <div id="app">${appHtml}</div>
          <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())};
          </script>
          <script src="/static/bundle.js"></script>
        </body>
      </html>
    `);
  });
});
```

### Шаг 3. Клиент подхватывает состояние сервера

**src/store/configureStore.prod.js (обновлённый):**
```js
import thunk from 'redux-thunk';
import { createStore, compose, applyMiddleware } from 'redux';
import rootReducer from '../reducers/root';
import crashReporting from '../middleware/crash';
import { isServer } from '../utils/environment';

let store;

export default function configureStore(initialState) {
  if (store && !isServer()) return store;

  const hydratedState =
    !isServer() && window.__INITIAL_STATE__
      ? window.__INITIAL_STATE__
      : initialState;

  store = createStore(
    rootReducer,
    hydratedState,
    compose(applyMiddleware(thunk, crashReporting))
  );
  return store;
}
```

### Шаг 4. Асинхронный рендеринг (renderToNodeStream)

Для больших приложений синхронный `renderToString` может блокировать сервер. `renderToNodeStream` рендерит по частям:

```js
import { renderToNodeStream } from 'react-dom/server';
import { start, end } from './html'; // функции, возвращающие HTML-обёртку

app.use('*', async (req, res) => {
  // ... match, data fetching, store setup ...

  res.setHeader('Content-type', 'text/html');
  res.write(start()); // <html><head>...</head><body><div id="app">

  const stream = renderToNodeStream(
    <Provider store={store}>
      <RouterContext {...props} />
    </Provider>
  );

  stream.pipe(res, { end: false });

  stream.on('end', () => {
    res.write(end(store.getState())); // </div><script>state</script></body></html>
    res.end();
  });
});
```

### Что мы сделали

Полный цикл SSR с данными:

```
1. Браузер → GET /  (с cookie 'letters-token')
2. Сервер:
   a. match() → находит компонент Home
   b. Читает cookie → verifyIdToken через Firebase
   c. Если пользователь есть → fetch данные, dispatch в store
   d. renderToString/renderToNodeStream → генерирует HTML
   e. Встраивает JSON.stringify(store.getState()) в HTML
   f. Отправляет ответ
3. Браузер:
   a. Показывает готовый HTML (мгновенно!)
   b. Загружает bundle.js
   c. hydrate() — React «подключается» к HTML
   d. Читает window.__INITIAL_STATE__ → создаёт store
   e. Приложение интерактивно
```

> **Важно:** на сервере store создаётся ЗАНОВО для каждого запроса. Иначе данные одного пользователя утекут другому.

---

## 22. Современный Redux: Redux Toolkit и хуки

### Задача

Познакомиться с современным подходом к Redux, который используется в новых проектах.

> Всё, что мы делали выше — это «классический» Redux. Он всё ещё работает и встречается в существующих проектах. Но в новых проектах используют **Redux Toolkit (RTK)** — официальный набор инструментов, который убирает boilerplate.

### Установка

```bash
npm install @reduxjs/toolkit react-redux
```

### Сравнение: классика vs RTK

**Классический Redux (то, что мы делали):**
```js
// types.js
export const INCREMENT = 'counter/increment';

// actions.js
export function increment() {
  return { type: INCREMENT };
}

// reducer.js
export function counter(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    default:
      return state;
  }
}

// store.js
import { createStore } from 'redux';
const store = createStore(counter);
```

**Redux Toolkit (современный подход):**
```js
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
  },
});

export const { increment } = counterSlice.actions;
const store = configureStore({ reducer: counterSlice.reducer });
```

RTK убирает необходимость:
- вручную писать action types
- вручную писать action creators
- вручную подключать redux-thunk (он встроен)
- вручную настраивать DevTools (они встроены)

### createSlice — вместо actions + reducer

`createSlice` автоматически создаёт action types и action creators из reducers:

```js
import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: {},
    ids: [],
    loading: false,
  },
  reducers: {
    addPost(state, action) {
      const post = action.payload;
      state.items[post.id] = post;
      state.ids.push(post.id);
    },
    toggleComments(state, action) {
      const postId = action.payload;
      state.items[postId].showComments = !state.items[postId].showComments;
    },
  },
});

export const { addPost, toggleComments } = postsSlice.actions;
export default postsSlice.reducer;
```

> Здесь мы «мутируем» state напрямую (`state.items[post.id] = post`). Это безопасно, потому что RTK использует библиотеку **Immer** — она перехватывает мутации и создаёт иммутабельную копию «за кулисами».

### createAsyncThunk — вместо ручных асинхронных экшенов

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as API from '../shared/http';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const res = await API.fetchPosts();
  return res.json();
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: {}, ids: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        for (const post of action.payload) {
          state.items[post.id] = post;
          if (!state.ids.includes(post.id)) {
            state.ids.push(post.id);
          }
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

`createAsyncThunk` автоматически создаёт три типа экшенов:
- `posts/fetchPosts/pending` — загрузка началась
- `posts/fetchPosts/fulfilled` — успех
- `posts/fetchPosts/rejected` — ошибка

### configureStore — вместо createStore + compose + applyMiddleware

```js
import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postsSlice';
import userReducer from './userSlice';
import commentsReducer from './commentsSlice';

const store = configureStore({
  reducer: {
    posts: postsReducer,
    user: userReducer,
    comments: commentsReducer,
  },
});

export default store;
```

`configureStore` автоматически:
- подключает redux-thunk
- подключает Redux DevTools
- включает проверку на случайные мутации (в dev-режиме)

### Хуки useSelector и useDispatch — вместо connect

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../store/postsSlice';
import { useEffect } from 'react';

function Home() {
  const dispatch = useDispatch();
  const posts = useSelector((state) =>
    state.posts.ids.map((id) => state.posts.items[id])
  );
  const loading = useSelector((state) => state.posts.loading);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

Больше не нужны `mapStateToProps`, `mapDispatchToProps`, `connect`, `bindActionCreators`. Хуки делают то же самое, но проще:

| Классика | Хуки |
|----------|------|
| `mapStateToProps` + `connect` | `useSelector(state => ...)` |
| `mapDispatchToProps` + `connect` | `useDispatch()` |
| `bindActionCreators` | Не нужен |

### Итоговое сравнение

| | Классический Redux | Redux Toolkit |
|---|---|---|
| **Файлов на фичу** | 3-4 (types, actions, reducer, selectors) | 1 (slice) |
| **Boilerplate** | Много | Минимум |
| **Иммутабельность** | Вручную (`...spread`) | Автоматически (Immer) |
| **Async** | Вручную + redux-thunk | `createAsyncThunk` |
| **DevTools** | Настраиваешь сам | Встроены |
| **Тесты** | Такие же простые | Такие же простые |

---

## Итоги Части 3

Мы прошли весь путь от «что такое Redux» до серверного рендеринга. Вот краткая карта:

| Тема | Что узнали |
|------|-----------|
| **Redux — основы** | Store один, state меняется только через dispatch(action) → reducer |
| **Actions** | Объекты с `type` + данные. Создаются через action creators |
| **Async actions** | redux-thunk позволяет dispatch'ить функции (для API-запросов) |
| **Middleware** | Перехватчик между dispatch и reducer. Для логов, ошибок, аналитики |
| **Reducers** | Чистые функции `(state, action) → newState`. Нельзя мутировать state |
| **combineReducers** | Объединяет slice-редьюсеры в один корневой |
| **react-redux** | `Provider` + `connect` (mapStateToProps, mapDispatchToProps) |
| **SSR** | `renderToString` / `renderToNodeStream` + `hydrate` на клиенте |
| **React Router** | `match` на сервере, `Router` + `browserHistory` на клиенте |
| **SSR + Redux** | Store на сервере → JSON в HTML → клиент подхватывает |
| **Redux Toolkit** | Современная замена: `createSlice`, `configureStore`, хуки |

> **Совет:** если начинаешь новый проект — сразу используй Redux Toolkit. Классический Redux изучай для чтения чужого кода и понимания основ.
