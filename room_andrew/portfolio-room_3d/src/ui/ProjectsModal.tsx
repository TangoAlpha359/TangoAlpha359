import ModalFrame from "./ModalFrame";

type Props = {
  onClose: () => void;
};

const projects = [
  {
    name: "Project Alpha",
    summary: "A featured build can live here with a short outcome-focused description.",
  },
  {
    name: "Project Beta",
    summary: "Use this slot for a case study, demo, or writing sample.",
  },
  {
    name: "Project Gamma",
    summary: "Later, each project console can become its own room or station.",
  },
];

export default function ProjectsModal({ onClose }: Props) {
  return (
    <ModalFrame title="Projects" eyebrow="Mission Archive" onClose={onClose}>
      <div className="project-list">
        {projects.map((project) => (
          <article key={project.name} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.summary}</p>
          </article>
        ))}
      </div>
    </ModalFrame>
  );
}
