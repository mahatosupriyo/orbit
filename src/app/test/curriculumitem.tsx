import styles from './curriculum.module.scss';

interface CurriculumItemProps {
  index: number;
  phase: string;
  title: string;
  description: string;
  bullets?: string[];
}

export default function CurriculumItem({
  index,
  phase,
  title,
  description,
  bullets,
}: CurriculumItemProps) {
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <span className={styles.phase}>{phase}</span>
        <span className={styles.index}>{index}</span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>
        {description.split('\n').map((line, idx) => (
          <span key={idx}>
            {line}
            {idx < description.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
      <ul className={styles.list}>
        {bullets && bullets.map((point, i) => (
          <li key={i} className={styles.bullet}>
            - {point}
          </li>
        ))}
      </ul>
    </div>
  );
}