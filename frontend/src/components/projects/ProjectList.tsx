// src/components/projects/ProjectList.tsx
import React from "react";
import { Project } from "../../types/project-types";

interface Props {
  projects: Project[];
  isLoading: boolean;
  onProjectSelect: (id: number) => void;
  onProjectEdit?: (proj: Project) => void;
  onProjectDelete?: (id: number) => void;
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

const ProjectList: React.FC<Props> = ({
  projects,
  isLoading,
  onProjectSelect,
  onProjectEdit,
  onProjectDelete,
  showCreateButton,
  onCreateNew,
}) => {
  if (isLoading) return <div>Loading...</div>;
  if (!projects.length)
    return <div>No projects found.</div>;

  return (
    <div className="project-list">
      {showCreateButton && (
        <button className="btn-primary" onClick={onCreateNew}>
          Create New Project
        </button>
      )}
      <ul>
        {projects.map(project => (
          <li key={project.id} className="project-card">
            <span onClick={() => onProjectSelect(project.id)}>
              {project.title}
            </span>
            {onProjectEdit && (
              <button onClick={() => onProjectEdit(project)}>
                Edit
              </button>
            )}
            {onProjectDelete && (
              <button onClick={() => onProjectDelete(project.id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
