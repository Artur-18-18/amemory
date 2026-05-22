import { motion } from "framer-motion";
import { FormEvent, useState } from "react";

interface PasswordGateProps {
  title: string;
  subtitle: string;
  onSubmit: (password: string) => Promise<void>;
  error?: string | null;
}

export function PasswordGate({ title, subtitle, onSubmit, error }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      await onSubmit(password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-md p-8 sm:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-luxury-glow/80">Защищённый раздел</p>
        <h1 className="mt-2 font-display text-3xl font-light">{title}</h1>
        <p className="mt-3 text-sm text-luxury-silver">{subtitle}</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          className="mt-8 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-luxury-glow/50 focus:shadow-glow"
          autoComplete="current-password"
        />

        {(localError || error) && (
          <p className="mt-3 text-sm text-red-400/90">{localError || error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-6 w-full rounded-full bg-white py-3 text-xs font-medium uppercase tracking-[0.2em] text-luxury-black transition hover:bg-luxury-glow disabled:opacity-50"
        >
          {loading ? "Проверка…" : "Войти"}
        </button>
      </motion.form>
    </div>
  );
}
