import { Component } from 'react';
import { createRoot } from 'react-dom/client';

// ─────────────────────────────────────────────
// Пример 1: автофокус поля при монтировании.
// ref даёт прямой доступ к DOM-элементу —
// можно вызывать на нём любые нативные методы.
// ─────────────────────────────────────────────

class AutoFocusInput extends Component {
    private inputRef: HTMLInputElement | null = null;

    componentDidMount() {
        // DOM уже готов — можно работать с элементом напрямую
        this.inputRef?.focus();
    }

    render() {
        return (
            <div>
                <h2>Пример 1: автофокус через ref</h2>
                <input
                    ref={(node) => { this.inputRef = node; }}
                    type="text"
                    placeholder="Этот input сфокусирован автоматически"
                    style={{ width: 300 }}
                />
            </div>
        );
    }
}

// ─────────────────────────────────────────────
// Пример 2: сторонняя «библиотека» через ref.
// Именно так подключаются Mapbox, D3, Chart.js —
// они получают DOM-узел и рисуют в нём сами.
// ─────────────────────────────────────────────

// Имитация сторонней библиотеки (в реальности это был бы Mapbox)
function initFakeMap(container: HTMLDivElement, lat: number, lng: number) {
    container.style.cssText = 'background:#d0e8c5;display:flex;align-items:center;justify-content:center;border:1px solid #aaa;border-radius:4px;';
    container.innerHTML = `<span style="font-size:14px">🗺 Карта: ${lat}, ${lng}</span>`;
}

interface DisplayMapProps {
    lat: number;
    lng: number;
}

interface DisplayMapState {
    mapLoaded: boolean;
}

class DisplayMap extends Component<DisplayMapProps, DisplayMapState> {
    // Ref хранится как поле класса — не в state, потому что
    // его изменение не должно вызывать перерендер.
    private mapNode: HTMLDivElement | null = null;

    constructor(props: DisplayMapProps) {
        super(props);
        this.state = { mapLoaded: false };
    }

    componentDidMount() {
        if (this.mapNode) {
            // Передаём DOM-узел сторонней библиотеке
            initFakeMap(this.mapNode, this.props.lat, this.props.lng);
            this.setState({ mapLoaded: true });
        }
    }

    render() {
        return (
            <div>
                <h2>Пример 2: сторонняя библиотека через ref</h2>
                <p style={{ fontSize: 13, color: '#666' }}>
                    {this.state.mapLoaded ? '✅ Карта загружена' : '⏳ Загрузка...'}
                </p>
                {/* ref={(node) => {...}} — колбэк, который React вызывает
                    после монтирования с реальным DOM-элементом */}
                <div
                    ref={(node) => { this.mapNode = node; }}
                    style={{ width: 300, height: 120 }}
                />
            </div>
        );
    }
}

function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24 }}>
            <AutoFocusInput />
            <hr />
            <DisplayMap lat={55.75} lng={37.62} />
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
