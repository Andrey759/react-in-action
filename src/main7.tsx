import { Component } from 'react';
import { createRoot } from 'react-dom/client';

// ─────────────────────────────────────────────
// Компонент 1: Counter
// Демонстрирует setState через функцию-updater.
// Новое значение считается от предыдущего state,
// шаг берётся из props — это правильный паттерн.
// ─────────────────────────────────────────────

interface CounterProps {
    incrementBy?: number;
}
interface CounterState {
    count: number;
}

class Counter extends Component<CounterProps, CounterState> {
    static defaultProps: CounterProps = {
        incrementBy: 1,
    };

    constructor(props: CounterProps) {
        super(props);
        this.state = { count: 0 };
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    onButtonClick() {
        // Функция-updater: (prevState, props) => newState
        // Используется когда новое значение зависит от предыдущего.
        // Обычный объект this.setState({ count: this.state.count + 1 })
        // ненадёжен при батчинге — React может объединить вызовы.
        this.setState((prevState, props) => ({
            count: prevState.count + (props.incrementBy ?? 1),
        }));
    }

    render() {
        return (
            <div className="counter">
                <h2>Counter</h2>
                <h1>{this.state.count}</h1>
                <button onClick={this.onButtonClick}>++</button>
            </div>
        );
    }
}

// ─────────────────────────────────────────────
// Компонент 2: ShallowMerge
// Демонстрирует ловушку shallow merge в setState.
// setState объединяет только верхний уровень state.
// Вложенные объекты перезаписываются целиком.
// ─────────────────────────────────────────────

interface ShallowMergeState {
    user: {
        name: string;
        colors: {
            favorite: string;
        };
    };
}

class ShallowMerge extends Component<object, ShallowMergeState> {
    constructor(props: object) {
        super(props);
        this.state = {
            user: {
                name: 'Mark',
                colors: { favorite: '' },
            },
        };
        this.onClickBroken = this.onClickBroken.bind(this);
        this.onClickFixed = this.onClickFixed.bind(this);
        this.onReset = this.onReset.bind(this);
    }

    // ❌ Сломанный вариант: весь объект user заменяется новым —
    // в нём нет name, поэтому name становится undefined.
    onClickBroken() {
        this.setState({
            user: {
                name: undefined as unknown as string, // намеренно пропущено
                colors: { favorite: 'blue' },
            },
        });
    }

    // ✅ Правильный вариант: spread сохраняет все поля user,
    // заменяется только colors.
    onClickFixed() {
        this.setState((prevState) => ({
            user: {
                ...prevState.user,
                colors: { favorite: 'blue' },
            },
        }));
    }

    onReset() {
        this.setState({
            user: { name: 'Mark', colors: { favorite: '' } },
        });
    }

    render() {
        const { name, colors } = this.state.user;
        return (
            <div className="shallowMerge">
                <h2>Shallow Merge</h2>
                <p>
                    Имя: <strong>{name ?? '⚠️ пропало!'}</strong>
                </p>
                <p>
                    Цвет: <strong>{colors.favorite || '(не выбран)'}</strong>
                </p>
                <button onClick={this.onClickBroken}>❌ Сломать (без spread)</button>
                <button onClick={this.onClickFixed}>✅ Починить (со spread)</button>
                <button onClick={this.onReset}>↩ Сбросить</button>
            </div>
        );
    }
}

// ─────────────────────────────────────────────
// Корневой компонент — собирает оба примера
// ─────────────────────────────────────────────

function App() {
    return (
        <div>
            <Counter incrementBy={1} />
            <hr />
            <ShallowMerge />
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);