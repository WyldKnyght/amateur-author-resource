// src/components/projects/CreateProjectForm.tsx
import React, { useState } from "react";
import { GENRE_OPTIONS, STATUS_OPTIONS } from "../../types/project-types";

interface Props {
  onSubmit: (projectData: any) => void;
  onCancel: () => void;
}

const CreateProjectForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<string>(GENRE_OPTIONS[0]);
  const [status, setStatus] = useState<"draft" | "in_progress" | "completed" | "published">(STATUS_OPTIONS[0].value);
  const [targetWordCount, setTargetWordCount] = useState<number | "">("");
  interface FormErrors {
    title?: string;
  }
  
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    onSubmit({ title, description, genre, status, targetWordCount });
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <h2>Create New Project</h2>
      <label>
        Title
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      <label>
        Genre
        <select value={genre} onChange={e => setGenre(e.target.value)}>
          {GENRE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </label>
      <label>
        Status
        <select value={status} onChange={e => setStatus(e.target.value as "draft" | "in_progress" | "completed" | "published")}>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Target Word Count
        <input
          type="number"
          min="0"
          value={targetWordCount}
          onChange={e => setTargetWordCount(Number(e.target.value))}
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Create</button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default CreateProjectForm;
