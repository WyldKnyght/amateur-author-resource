// src/components/projects/DeleteProjectModal.tsx
import React from "react";
import { Project } from "../../types/project-types";

interface Props {
  project: Project | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteProjectModal: React.FC<Props> = ({ project, onConfirm, onCancel }) => {
  if (!project) {
    return null;
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Delete Project</h2>
        <p>
// sourcery skip: only-delete-object-properties
          Are you sure you want to delete "<strong>{project.title}</strong>"?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-danger" onClick={onConfirm}>Remove</button>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;
