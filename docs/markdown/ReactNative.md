# React Native на практике

> Практическое руководство на основе главы 13 книги «React In Action» (Thomas M.T.)
> Философия: учимся делая. Минимум теории — максимум кода.
>
> **Примечание.** Книга даёт лишь обзорное введение в React Native. Мы берём её идеи за основу и строим полноценное практическое руководство — с реальными примерами, которые можно запустить и потрогать. Используется **Expo SDK** (современный стандарт быстрого старта) и функциональные компоненты с хуками.

---

## Содержание

1. [Что такое React Native — за 2 минуты](#1-что-такое-react-native--за-2-минуты)
2. [Установка и создание проекта](#2-установка-и-создание-проекта)
3. [Базовые компоненты: View и Text](#3-базовые-компоненты-view-и-text)
4. [Стилизация: StyleSheet и Flexbox](#4-стилизация-stylesheet-и-flexbox)
5. [Обработка событий: кнопки и нажатия](#5-обработка-событий-кнопки-и-нажатия)
6. [Состояние (useState) и ввод текста](#6-состояние-usestate-и-ввод-текста)
7. [Списки: FlatList и SectionList](#7-списки-flatlist-и-sectionlist)
8. [Изображения: локальные и из сети](#8-изображения-локальные-и-из-сети)
9. [Загрузка данных из API (fetch)](#9-загрузка-данных-из-api-fetch)
10. [Навигация между экранами](#10-навигация-между-экранами)
11. [Платформо-зависимый код](#11-платформо-зависимый-код)
12. [Хранение данных: AsyncStorage](#12-хранение-данных-asyncstorage)
13. [Итоговый мини-проект: Список задач](#13-итоговый-мини-проект-список-задач)
14. [Куда двигаться дальше](#14-куда-двигаться-дальше)

---

## 1. Что такое React Native — за 2 минуты

React Native — это фреймворк от Meta (Facebook) для создания **настоящих нативных** мобильных приложений на JavaScript и React.

Ключевая идея:

```
Твой JS-код
  → React Native bridge
    → Нативные компоненты iOS/Android
```

Ты пишешь компоненты на React, а React Native превращает их в нативные элементы интерфейса (не в WebView, а в настоящие нативные виджеты). Благодаря этому приложения выглядят и работают как обычные нативные приложения.

### React vs React Native — главные отличия

| Аспект | React (Web) | React Native |
|--------|------------|--------------|
| **Рендеринг** | DOM-элементы (`div`, `span`, `p`) | Нативные компоненты (`View`, `Text`, `Image`) |
| **Стили** | CSS-файлы, CSS-in-JS | `StyleSheet.create()` (Flexbox по умолчанию) |
| **События** | `onClick`, `onChange` | `onPress`, `onChangeText` |
| **Навигация** | React Router (URL) | React Navigation (стек экранов) |
| **Платформа** | Браузер | iOS, Android |
| **Компоненты, хуки, JSX** | ✅ | ✅ (всё то же самое) |

> **Запомни:** если ты знаешь React — ты уже знаешь 70% React Native. Компоненты, props, state, хуки, JSX — всё работает одинаково. Отличаются только «кирпичики» UI и способ стилизации.

---

## 2. Установка и создание проекта

### Задача

Создать и запустить первый React Native проект.

### Шаг 1. Устанавливаем Node.js

React Native требует Node.js 18+. Проверь версию:

```bash
node -v
```

### Шаг 2. Создаём проект через Expo

Expo — это платформа, которая упрощает создание, разработку и сборку React Native приложений. Не нужно настраивать Xcode или Android Studio для начала работы.

```bash
npx create-expo-app@latest MyFirstApp
cd MyFirstApp
```

### Шаг 3. Запускаем

```bash
npx expo start
```

После запуска ты увидишь QR-код в терминале. Варианты просмотра:
- **На телефоне:** установи приложение **Expo Go** (App Store / Google Play), отсканируй QR-код
- **В эмуляторе:** нажми `a` (Android) или `i` (iOS) в терминале
- **В браузере:** нажми `w`

### Шаг 4. Смотрим на стартовый файл

Открой `app/(tabs)/index.tsx` (или `App.js` если создал без шаблона). Замени содержимое на минимальный пример:

**App.js:**
```jsx
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Привет, React Native!</Text>
    </View>
  );
}
```

Сохрани файл — приложение обновится автоматически (hot reload).

### Что мы сделали

Создали проект через Expo, запустили dev-сервер и увидели результат на устройстве. Expo берёт на себя конфигурацию сборки, а hot reload позволяет мгновенно видеть изменения — не нужно ждать компиляции, как в традиционной мобильной разработке.

---

## 3. Базовые компоненты: View и Text

### Задача

Освоить два главных «кирпичика» React Native — `View` и `Text`.

### Аналогия с веб

| React Native | Web HTML | Назначение |
|-------------|----------|------------|
| `<View>` | `<div>` | Контейнер для компоновки |
| `<Text>` | `<span>` / `<p>` | Отображение текста |

В React Native **весь текст** должен быть внутри `<Text>`. Просто написать строку внутри `<View>` — ошибка.

### Шаг 1. Карточка пользователя

```jsx
import { View, Text, StyleSheet } from 'react-native';

function UserCard({ name, role, email }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <UserCard name="Анна Иванова" role="Frontend-разработчик" email="anna@example.com" />
      <UserCard name="Пётр Сидоров" role="Дизайнер" email="petr@example.com" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
});
```

### Шаг 2. Вложенные Text-элементы

`<Text>` можно вкладывать друг в друга — внутренний наследует стили внешнего:

```jsx
<Text style={{ fontSize: 16, color: '#333' }}>
  Обычный текст, а вот <Text style={{ fontWeight: 'bold' }}>жирный</Text> и{' '}
  <Text style={{ color: 'red' }}>красный</Text>.
</Text>
```

### Что мы сделали

`View` — это контейнер-«коробка» для компоновки (как `div`). `Text` — единственный способ показать текст. Мы создали переиспользуемый компонент `UserCard` с props — точно так же, как делали бы в React для веба. Разница только в элементах: `View` вместо `div`, `Text` вместо `span`.

---

## 4. Стилизация: StyleSheet и Flexbox

### Задача

Разобраться, как стилизовать компоненты в React Native.

### Главные правила стилизации

1. **Нет CSS-файлов.** Стили задаются JS-объектами через `StyleSheet.create()`.
2. **CamelCase вместо kebab-case:** `backgroundColor` вместо `background-color`.
3. **Размеры без единиц:** числа — это density-independent pixels (dp).
4. **Flexbox включён по умолчанию.** Каждый `View` — это flex-контейнер с `flexDirection: 'column'`.

### Шаг 1. Flex-раскладка

```jsx
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Заголовок</Text>
      </View>

      <View style={styles.content}>
        <Text>Основной контент</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Подвал</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 80,
    backgroundColor: '#2196F3',
    justifyContent: 'flex-end',
    padding: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  footer: {
    height: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
  },
});
```

### Шаг 2. Горизонтальная раскладка

По умолчанию `flexDirection: 'column'` (сверху вниз). Для строки:

```jsx
<View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
  <View style={{ width: 80, height: 80, backgroundColor: '#e74c3c', borderRadius: 8 }} />
  <View style={{ width: 80, height: 80, backgroundColor: '#2ecc71', borderRadius: 8 }} />
  <View style={{ width: 80, height: 80, backgroundColor: '#3498db', borderRadius: 8 }} />
</View>
```

### Шаг 3. Комбинирование стилей

Можно передать массив стилей — правые перезаписывают левые:

```jsx
<Text style={[styles.text, styles.bold, { color: 'red' }]}>
  Красный жирный текст
</Text>
```

### Flexbox-шпаргалка

```
flexDirection:    'column' | 'row'              — направление оси
justifyContent:   'center' | 'space-between' | 'flex-start' | 'flex-end' | 'space-around'
alignItems:       'center' | 'flex-start' | 'flex-end' | 'stretch'
flex: 1           — занять всё доступное пространство
flexWrap: 'wrap'  — перенос на новую строку
```

### Что мы сделали

Стилизация в React Native — это JS-объекты с Flexbox по умолчанию. `StyleSheet.create()` валидирует стили и оптимизирует их. Flex-раскладка работает так же, как в CSS Flexbox, но `flexDirection` по умолчанию `column` (в вебе — `row`). Это единственное существенное отличие.

---

## 5. Обработка событий: кнопки и нажатия

### Задача

Научиться обрабатывать нажатия — основной способ взаимодействия на мобильных устройствах.

### Шаг 1. Кнопки

React Native предоставляет несколько компонентов для нажатий:

```jsx
import { View, Text, Button, TouchableOpacity, Pressable, Alert, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>

      {/* Простая кнопка — минимум настроек */}
      <Button
        title="Простая кнопка"
        onPress={() => Alert.alert('Нажато!', 'Ты нажал кнопку')}
      />

      <View style={{ height: 20 }} />

      {/* TouchableOpacity — кнопка с кастомным дизайном */}
      <TouchableOpacity
        style={styles.customButton}
        onPress={() => Alert.alert('TouchableOpacity')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Кастомная кнопка</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      {/* Pressable — современная альтернатива (рекомендуется) */}
      <Pressable
        style={({ pressed }) => [styles.customButton, pressed && { opacity: 0.6 }]}
        onPress={() => Alert.alert('Pressable')}
      >
        <Text style={styles.buttonText}>Pressable-кнопка</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  customButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Шаг 2. Счётчик нажатий

```jsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>

      <View style={styles.buttons}>
        <Pressable style={[styles.btn, { backgroundColor: '#e74c3c' }]} onPress={() => setCount(c => c - 1)}>
          <Text style={styles.btnText}>−</Text>
        </Pressable>

        <Pressable style={[styles.btn, { backgroundColor: '#95a5a6' }]} onPress={() => setCount(0)}>
          <Text style={styles.btnText}>Сброс</Text>
        </Pressable>

        <Pressable style={[styles.btn, { backgroundColor: '#2ecc71' }]} onPress={() => setCount(c => c + 1)}>
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  count: { fontSize: 72, fontWeight: 'bold', marginBottom: 40 },
  buttons: { flexDirection: 'row', gap: 16 },
  btn: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
```

### Что мы сделали

В React Native вместо `onClick` используется `onPress`. `Button` — простая встроенная кнопка с ограниченной кастомизацией. `Pressable` — современный компонент, позволяющий полностью контролировать внешний вид и реакцию на нажатие. `Alert.alert()` — нативный диалог (аналог `window.alert()` в браузере). `useState` работает точно так же, как в React для веба.

---

## 6. Состояние (useState) и ввод текста

### Задача

Научиться работать с пользовательским вводом — текстовые поля, управляемые компоненты.

### Шаг 1. TextInput — базовый ввод

```jsx
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function App() {
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Как тебя зовут?</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Введи имя..."
        placeholderTextColor="#999"
      />

      {name.length > 0 && (
        <Text style={styles.greeting}>Привет, {name}! 👋</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 8, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 24, marginTop: 20, color: '#2196F3' },
});
```

### Шаг 2. Форма с несколькими полями

```jsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function RegistrationForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.success}>Регистрация завершена!</Text>
        <Text style={styles.info}>Имя: {form.name}</Text>
        <Text style={styles.info}>Email: {form.email}</Text>
        <Pressable style={styles.button} onPress={() => { setForm({ name: '', email: '', password: '' }); setSubmitted(false); }}>
          <Text style={styles.buttonText}>Заново</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Регистрация</Text>

      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={v => updateField('name', v)}
        placeholder="Имя"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={v => updateField('email', v)}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        value={form.password}
        onChangeText={v => updateField('password', v)}
        placeholder="Пароль"
        secureTextEntry
      />

      <Pressable
        style={[styles.button, !form.name && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={!form.name}
      >
        <Text style={styles.buttonText}>Зарегистрироваться</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  success: { fontSize: 24, fontWeight: 'bold', color: '#2ecc71', textAlign: 'center', marginBottom: 16 },
  info: { fontSize: 16, color: '#333', marginBottom: 4 },
});
```

### Что мы сделали

`TextInput` — аналог `<input>` из веба, но вместо `onChange` используется `onChangeText` (сразу возвращает строку, а не event-объект). Управляемый компонент работает через `value` + `onChangeText` — как и в React для веба. `KeyboardAvoidingView` автоматически поднимает контент, чтобы клавиатура не перекрывала поля ввода — типичная мобильная проблема, которой нет в вебе. `secureTextEntry` — скрывает пароль, `keyboardType` — подсказывает устройству, какую клавиатуру показать.

---

## 7. Списки: FlatList и SectionList

### Задача

Научиться отображать длинные списки данных эффективно.

### Почему не просто map?

В React для веба мы часто делаем `items.map(item => <div>...</div>)`. В React Native так тоже можно, но для длинных списков это **медленно** — все элементы рендерятся сразу. `FlatList` рендерит только видимые элементы (виртуализация).

### Шаг 1. Простой FlatList

```jsx
import { View, Text, FlatList, StyleSheet } from 'react-native';

const DATA = [
  { id: '1', title: 'JavaScript', desc: 'Язык веба' },
  { id: '2', title: 'TypeScript', desc: 'JS с типами' },
  { id: '3', title: 'Python', desc: 'Универсальный язык' },
  { id: '4', title: 'Rust', desc: 'Безопасность и скорость' },
  { id: '5', title: 'Go', desc: 'Простота и параллелизм' },
  { id: '6', title: 'Kotlin', desc: 'Современная Java' },
  { id: '7', title: 'Swift', desc: 'Язык Apple' },
];

function LanguageItem({ title, desc }) {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Языки программирования</Text>
      <FlatList
        data={DATA}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LanguageItem title={item.title} desc={item.desc} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 12 },
  item: { paddingVertical: 12, paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  desc: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee', marginHorizontal: 16 },
});
```

### Шаг 2. SectionList — группированный список

```jsx
import { View, Text, SectionList, StyleSheet } from 'react-native';

const SECTIONS = [
  {
    title: 'Фрукты',
    data: ['Яблоко', 'Банан', 'Апельсин', 'Манго'],
  },
  {
    title: 'Овощи',
    data: ['Морковь', 'Брокколи', 'Шпинат', 'Томат'],
  },
  {
    title: 'Ягоды',
    data: ['Клубника', 'Черника', 'Малина'],
  },
];

export default function App() {
  return (
    <SectionList
      style={styles.list}
      sections={SECTIONS}
      keyExtractor={(item, index) => item + index}
      renderItem={({ item }) => (
        <Text style={styles.item}>{item}</Text>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, paddingTop: 60 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  item: { fontSize: 16, paddingVertical: 10, paddingHorizontal: 24 },
});
```

### Что мы сделали

`FlatList` — основной компонент для длинных списков. Он принимает `data` (массив), `renderItem` (функция рендеринга) и `keyExtractor` (аналог `key` в `map()`). `SectionList` — то же самое, но с группировкой по секциям. Оба компонента виртуализируют список: рендерят только видимые элементы. Для списка из 10 элементов разницы не будет, но для 1000+ — `FlatList` критически важен.

---

## 8. Изображения: локальные и из сети

### Задача

Научиться отображать изображения — из проекта и из интернета.

### Шаг 1. Локальное и сетевое изображение

```jsx
import { View, Image, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Сетевое изображение — обязательно указать width и height */}
      <Image
        source={{ uri: 'https://picsum.photos/300/200' }}
        style={styles.networkImage}
      />
      <Text style={styles.caption}>Случайное фото из Lorem Picsum</Text>

      {/* Локальное изображение — размеры берутся из файла */}
      {/* <Image source={require('./assets/icon.png')} style={styles.localImage} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  networkImage: { width: 300, height: 200, borderRadius: 12 },
  localImage: { width: 100, height: 100 },
  caption: { marginTop: 8, color: '#666' },
});
```

### Шаг 2. Аватар с fallback

```jsx
import { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

function Avatar({ uri, name, size = 60 }) {
  const [hasError, setHasError] = useState(false);
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase();

  if (hasError || !uri) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setHasError(true)}
    />
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <Avatar uri="https://i.pravatar.cc/120" name="Анна Иванова" size={80} />
      <Avatar uri="https://broken-url.example" name="Пётр Сидоров" size={80} />
      <Avatar uri={null} name="Мария Козлова" size={80} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  fallback: { backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
```

### Что мы сделали

`Image` — встроенный компонент для изображений. Для сетевых изображений обязательно указывать `width` и `height` (в отличие от `<img>` в вебе, React Native не может определить размер до загрузки). Для локальных файлов используется `require()`. `onError` позволяет обработать ошибку загрузки — мы показываем инициалы вместо сломанной картинки.

---

## 9. Загрузка данных из API (fetch)

### Задача

Загрузить данные из внешнего API и отобразить их в списке. Это пример из книги (Star Wars API), расширенный и модернизированный.

### Шаг 1. Пример из книги — список персонажей Star Wars

Книга использует классовый компонент. Вот современная версия с хуками:

```jsx
import { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

export default function StarWarsApp() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPeople() {
      try {
        const res = await fetch('https://swapi.dev/api/people');
        const data = await res.json();
        setPeople(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPeople();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fcd433" />
        <Text style={styles.loadingText}>Загрузка из далёкой галактики...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Персонажи Star Wars</Text>
      <FlatList
        data={people}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>Рост: {item.height} см</Text>
            <Text style={styles.detail}>Вес: {item.mass} кг</Text>
            <Text style={styles.detail}>Год рождения: {item.birth_year}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fcd433', textAlign: 'center', marginBottom: 16 },
  loadingText: { color: '#fcd433', marginTop: 12, fontSize: 16 },
  errorText: { color: '#e74c3c', fontSize: 16 },
  card: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#fcd433',
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#fcd433' },
  detail: { fontSize: 14, color: '#ccc', marginTop: 4 },
});
```

### Шаг 2. Выносим логику загрузки в кастомный хук

Когда проект растёт, логику загрузки данных удобно выносить в отдельный хук:

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

Теперь можно использовать этот хук в любом компоненте:

```jsx
function PlanetsScreen() {
  const { data, loading, error } = useFetch('https://swapi.dev/api/planets');

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Ошибка: {error}</Text>;

  return (
    <FlatList
      data={data.results}
      keyExtractor={item => item.name}
      renderItem={({ item }) => <Text style={{ padding: 12, fontSize: 16 }}>{item.name}</Text>}
    />
  );
}
```

### Шаг 3. Pull-to-refresh

Мобильный паттерн — потянуть список вниз для обновления:

```jsx
function PeopleList() {
  const [people, setPeople] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPeople = async () => {
    const res = await fetch('https://swapi.dev/api/people');
    const data = await res.json();
    setPeople(data.results);
  };

  useEffect(() => { loadPeople(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={people}
      keyExtractor={item => item.name}
      renderItem={({ item }) => (
        <Text style={{ padding: 16, fontSize: 16 }}>{item.name}</Text>
      )}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}
```

### Что мы сделали

Fetch API в React Native работает так же, как в браузере — это одно из преимуществ, упомянутых в книге. `useEffect` + `fetch` — стандартный паттерн загрузки данных. `ActivityIndicator` — нативный спиннер загрузки. Кастомный хук `useFetch` инкапсулирует логику загрузки и флаг `cancelled` защищает от обновления стейта в размонтированном компоненте. Pull-to-refresh — типичный мобильный паттерн, который `FlatList` поддерживает из коробки.

---

## 10. Навигация между экранами

### Задача

Научиться переключаться между экранами. В мобильных приложениях нет URL-адресов — вместо роутера используется стек экранов.

### Шаг 1. Устанавливаем React Navigation

```bash
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

### Шаг 2. Два экрана со стек-навигацией

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

const COURSES = [
  { id: '1', title: 'React Basics', duration: '4 часа', description: 'Компоненты, props, state и хуки. Основы React для начинающих.' },
  { id: '2', title: 'React Native', duration: '6 часов', description: 'Создание мобильных приложений с React Native и Expo.' },
  { id: '3', title: 'Redux', duration: '3 часа', description: 'Управление состоянием: actions, reducers, store, middleware.' },
  { id: '4', title: 'TypeScript', duration: '5 часов', description: 'Типизация JavaScript-кода. Generics, utility types, strict mode.' },
];

function HomeScreen({ navigation }) {
  return (
    <FlatList
      data={COURSES}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Details', { course: item })}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDuration}>{item.duration}</Text>
        </Pressable>
      )}
    />
  );
}

function DetailsScreen({ route }) {
  const { course } = route.params;

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailTitle}>{course.title}</Text>
      <Text style={styles.detailDuration}>Длительность: {course.duration}</Text>
      <Text style={styles.detailDesc}>{course.description}</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Курсы' }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Подробности' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardDuration: { fontSize: 14, color: '#888', marginTop: 4 },
  detailContainer: { flex: 1, padding: 20 },
  detailTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  detailDuration: { fontSize: 16, color: '#666', marginBottom: 16 },
  detailDesc: { fontSize: 16, lineHeight: 24, color: '#333' },
});
```

### Шаг 3. Tab-навигация (вкладки)

```bash
npx expo install @react-navigation/bottom-tabs
```

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

function FeedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Лента</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Профиль</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Настройки</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#2196F3' }}>
        <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Лента' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### Что мы сделали

`React Navigation` — стандартная библиотека навигации для React Native (книга упоминает React Router, но для мобильных приложений React Navigation — де-факто стандарт). `Stack.Navigator` создаёт стек экранов — как стопка карт: новый экран «ложится» поверх предыдущего, кнопка «Назад» снимает его. Данные между экранами передаются через `navigation.navigate('Name', { params })` и читаются через `route.params`. `Tab.Navigator` создаёт нижние вкладки — классический паттерн мобильных приложений.

---

## 11. Платформо-зависимый код

### Задача

Научиться писать код, который ведёт себя по-разному на iOS и Android.

Книга упоминает, что React Native позволяет писать платформо-зависимый код. Вот как это делается на практике.

### Способ 1. Platform.OS

```jsx
import { Platform, View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Ты используешь: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
      </Text>
      <Text style={styles.text}>
        Версия: {Platform.Version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#f0f0f5' : '#fafafa',
  },
  text: {
    fontSize: 18,
    ...Platform.select({
      ios: { fontFamily: 'Helvetica' },
      android: { fontFamily: 'Roboto' },
    }),
  },
});
```

### Способ 2. Platform.select

```jsx
const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
});
```

### Способ 3. Файлы с расширением .ios.js / .android.js

Создай два файла:

```
components/
  Header.ios.js    ← используется на iOS
  Header.android.js ← используется на Android
```

Импорт остаётся одинаковым — React Native автоматически выберет нужный файл:

```jsx
import Header from './components/Header';
```

### Что мы сделали

`Platform.OS` возвращает `'ios'` или `'android'`. `Platform.select()` позволяет задать разные значения для каждой платформы в одном месте. Разделение по файлам (`.ios.js` / `.android.js`) удобно, когда различия между платформами существенные. В большинстве случаев хватает `Platform.select()`.

---

## 12. Хранение данных: AsyncStorage

### Задача

Научиться сохранять данные локально на устройстве — чтобы они не терялись при закрытии приложения.

### Шаг 1. Установка

```bash
npx expo install @react-native-async-storage/async-storage
```

### Шаг 2. Приложение с сохраняемыми заметками

```jsx
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@notes';

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setNotes(JSON.parse(stored));
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Ошибка сохранения:', e);
    }
  };

  const addNote = () => {
    if (!text.trim()) return;
    const newNote = { id: Date.now().toString(), text: text.trim(), date: new Date().toLocaleDateString() };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setText('');
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Заметки</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Новая заметка..."
          onSubmitEditing={addNote}
        />
        <Pressable style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.noteText}>{item.text}</Text>
              <Text style={styles.noteDate}>{item.date}</Text>
            </View>
            <Pressable onPress={() => deleteNote(item.id)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Пока нет заметок. Добавь первую!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  noteText: { fontSize: 16, color: '#333' },
  noteDate: { fontSize: 12, color: '#999', marginTop: 4 },
  deleteBtn: { fontSize: 18, color: '#e74c3c', padding: 8 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
```

### Что мы сделали

`AsyncStorage` — это аналог `localStorage` из браузера, но асинхронный (все операции возвращают Promise). Данные хранятся в виде строк, поэтому объекты нужно сериализовать через `JSON.stringify`/`JSON.parse`. При запуске приложения (`useEffect`) мы загружаем заметки из хранилища, а при каждом изменении — сохраняем обратно. Данные переживают закрытие и перезапуск приложения.

---

## 13. Итоговый мини-проект: Список задач

### Задача

Собрать все полученные знания в одно приложение — To-Do List с несколькими экранами, хранением данных и стилями.

### Структура приложения

```
App
├── HomeScreen      — список задач (FlatList, AsyncStorage)
├── AddScreen       — добавление задачи (TextInput, навигация)
└── Tab Navigation  — переключение между экранами
```

### Полный код

**App.js:**
```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const STORAGE_KEY = '@todos';

// ─── Хук для работы с задачами ───────────────────

function useTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) setTodos(JSON.parse(stored));
    });
  }, []);

  const persist = useCallback(async (updated) => {
    setTodos(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addTodo = useCallback((title) => {
    const newTodo = {
      id: Date.now().toString(),
      title,
      done: false,
      createdAt: new Date().toLocaleDateString(),
    };
    persist([newTodo, ...todos]);
  }, [todos, persist]);

  const toggleTodo = useCallback((id) => {
    persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [todos, persist]);

  const deleteTodo = useCallback((id) => {
    persist(todos.filter(t => t.id !== id));
  }, [todos, persist]);

  return { todos, addTodo, toggleTodo, deleteTodo };
}

// ─── Экран: Список задач ──────────────────────────

function HomeScreen({ todos, toggleTodo, deleteTodo }) {
  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);

  const confirmDelete = (id) => {
    Alert.alert('Удалить задачу?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable style={{ flex: 1 }} onPress={() => toggleTodo(item.id)}>
        <Text style={[styles.todoText, item.done && styles.todoDone]}>
          {item.done ? '✓ ' : '○ '}{item.title}
        </Text>
        <Text style={styles.todoDate}>{item.createdAt}</Text>
      </Pressable>
      <Pressable onPress={() => confirmDelete(item.id)} hitSlop={8}>
        <Text style={styles.deleteBtn}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Мои задачи</Text>
      <Text style={styles.stats}>
        Активных: {pending.length} · Выполнено: {done.length}
      </Text>

      {todos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет задач</Text>
          <Text style={styles.emptyHint}>Перейди на вкладку «Добавить»</Text>
        </View>
      ) : (
        <FlatList
          data={[...pending, ...done]}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// ─── Экран: Добавление задачи ─────────────────────

function AddScreen({ addTodo }) {
  const [title, setTitle] = useState('');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введи название задачи');
      return;
    }
    addTodo(title.trim());
    setTitle('');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Новая задача</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Что нужно сделать?"
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />

      <Pressable
        style={[styles.primaryButton, !title.trim() && { opacity: 0.5 }]}
        onPress={handleAdd}
        disabled={!title.trim()}
      >
        <Text style={styles.primaryButtonText}>Добавить</Text>
      </Pressable>

      {added && (
        <Text style={styles.successMessage}>Задача добавлена!</Text>
      )}
    </View>
  );
}

// ─── Корневой компонент ───────────────────────────

export default function App() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { paddingBottom: 6, height: 56 },
        }}
      >
        <Tab.Screen
          name="Home"
          options={{ title: 'Задачи', tabBarBadge: todos.filter(t => !t.done).length || undefined }}
        >
          {() => <HomeScreen todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />}
        </Tab.Screen>
        <Tab.Screen name="Add" options={{ title: 'Добавить' }}>
          {() => <AddScreen addTodo={addTodo} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Стили ────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  stats: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
  },
  todoDone: {
    color: '#aaa',
    textDecorationLine: 'line-through',
  },
  todoDate: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 2,
  },
  deleteBtn: {
    fontSize: 16,
    color: '#e74c3c',
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#ccc',
  },
  emptyHint: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    color: '#2ecc71',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Что мы сделали

Мы собрали мини-проект, который использует всё, что изучили:

| Тема | Где в проекте |
|------|---------------|
| **View, Text** | Все экраны |
| **StyleSheet, Flexbox** | Стили карточек задач, раскладка экранов |
| **Pressable, onPress** | Переключение задачи, удаление |
| **useState, useEffect** | Хук `useTodos` |
| **TextInput** | Ввод названия задачи |
| **FlatList** | Список задач |
| **AsyncStorage** | Сохранение задач между запусками |
| **React Navigation (Tabs)** | Переключение между экранами |
| **Alert** | Подтверждение удаления |
| **Кастомный хук** | `useTodos` — инкапсуляция логики |

---

## 14. Куда двигаться дальше

Ты прошёл главные основы React Native. Вот план дальнейшего развития:

### Следующие темы

| Тема | Зачем | Ресурс |
|------|-------|--------|
| **Expo Router** | Файловый роутинг (как Next.js) | https://docs.expo.dev/router/introduction/ |
| **Анимации (Reanimated)** | Плавные анимации на 60 fps | https://docs.swmansion.com/react-native-reanimated/ |
| **Работа с камерой и геолокацией** | Доступ к оборудованию устройства | Expo SDK — Camera, Location |
| **TypeScript** | Типизация компонентов и навигации | Expo создаёт TS-проект по умолчанию |
| **Формы (React Hook Form)** | Удобная валидация форм | https://react-hook-form.com/ |
| **Состояние (Zustand)** | Лёгкая замена Redux для мобильных приложений | https://zustand-demo.pmnd.rs/ |
| **Публикация в App Store / Google Play** | Сборка и релиз | `eas build` через Expo |

### Полезные ресурсы

- **Документация React Native:** https://reactnative.dev/
- **Документация Expo:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **«React Native in Action» (Nader Dabit)** — книга, которую рекомендует автор как следующий шаг

### Главный принцип

Книга упоминает фразу **«Learn once, write anywhere»** — «Выучи один раз, пиши везде». Это суть React-платформы: компоненты, props, state, хуки, JSX — одни и те же концепции на всех платформах. Различаются только «кирпичики» (`View` вместо `div`) и способ доставки до пользователя. Осваивай React Native на практике — создавай маленькие приложения и постепенно добавляй сложность.
