import { useTheme } from '../theme/ThemeContext';
import styles from './Stylesheets/ThemeToggle.module.css';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={`${styles.toggle} ${theme === 'dark' ? styles.dark : ''}`}
            onClick={toggleTheme}
        >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
    );
}