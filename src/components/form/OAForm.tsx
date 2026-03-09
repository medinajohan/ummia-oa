import { useState, useCallback } from "react";
import type { CreateOAInput, OAEstado } from "../../mocks/mockOA";
import "./OAForm.css";

type FormErrors = Partial<Record<keyof CreateOAInput, string>>;

const LEVELS = ["1B", "2B", "3B", "4B", "1M", "2M", "3M", "4M"];
const SUBJECTS = [
  "Matemática",
  "Lenguaje",
  "Ciencias",
  "Historia",
  "Física",
  "Química",
  "Biología",
  "Geografía",
  "Historia",
  "Economía",
  "Sociología",
];

const EMPTY_FORM: CreateOAInput = {
  codigo: "",
  descripcion: "",
  nivel: "",
  asignatura: "",
  pais: "",
};

type Props = {
  country: string;
  creating: boolean;
  onSubmit: (input: CreateOAInput) => Promise<void>;
  onCancel: () => void;
};

export function OAForm({ country, creating, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateOAInput>({ ...EMPTY_FORM, pais: country });
  const [estado, setEstado] = useState<OAEstado>("ACTIVO");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof CreateOAInput>(field: K, value: CreateOAInput[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => new Set(prev).add(field));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
    },
    [form, estado, country, onSubmit],
  );

  const showError = (field: keyof CreateOAInput) =>
    touched.has(field) && errors[field] ? errors[field] : null;

  return (
    <form className="oa-form" onSubmit={handleSubmit} noValidate>
      <h2 className="oa-form__title">Crear Objetivo de Aprendizaje</h2>

      {submitError && <p className="oa-form__submit-error">{submitError}</p>}

      <div className="oa-form__field">
        <label htmlFor="codigo">Código</label>
        <input
          id="codigo"
          type="text"
          placeholder="MAT-1B-01"
          value={form.codigo}
          onChange={(e) => updateField("codigo", e.target.value.toUpperCase())}
          className={showError("codigo") ? "input--error" : ""}
        />
        {showError("codigo") && (
          <span className="field-error">{errors.codigo}</span>
        )}
      </div>

      <div className="oa-form__field">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          placeholder="Describe el objetivo de aprendizaje..."
          value={form.descripcion}
          onChange={(e) => updateField("descripcion", e.target.value)}
          rows={3}
          className={showError("descripcion") ? "input--error" : ""}
        />
        {showError("descripcion") && (
          <span className="field-error">{errors.descripcion}</span>
        )}
      </div>

      <div className="oa-form__row">
        <div className="oa-form__field">
          <label htmlFor="nivel">Nivel</label>
          <select
            id="nivel"
            value={form.nivel}
            onChange={(e) => updateField("nivel", e.target.value)}
            className={showError("nivel") ? "input--error" : ""}
          >
            <option value="">Seleccionar...</option>
            {LEVELS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {showError("nivel") && (
            <span className="field-error">{errors.nivel}</span>
          )}
        </div>

        <div className="oa-form__field">
          <label htmlFor="asignatura">Asignatura</label>
          <select
            id="asignatura"
            value={form.asignatura}
            onChange={(e) => updateField("asignatura", e.target.value)}
            className={showError("asignatura") ? "input--error" : ""}
          >
            <option value="">Seleccionar...</option>
            {SUBJECTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {showError("asignatura") && (
            <span className="field-error">{errors.asignatura}</span>
          )}
        </div>
      </div>

      <div className="oa-form__field">
        <label>Estado</label>
        <div className="oa-form__toggle">
          <button
            type="button"
            className={`toggle-btn ${estado === "ACTIVO" ? "toggle-btn--active" : ""}`}
            onClick={() => setEstado("ACTIVO")}
          >
            Activo
          </button>
          <button
            type="button"
            className={`toggle-btn ${estado === "INACTIVO" ? "toggle-btn--inactive" : ""}`}
            onClick={() => setEstado("INACTIVO")}
          >
            Inactivo
          </button>
        </div>
      </div>

      <div className="oa-form__actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={creating}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-submit" disabled={creating}>
          {creating ? "Creando..." : "Crear OA"}
        </button>
      </div>
    </form>
  );
}
