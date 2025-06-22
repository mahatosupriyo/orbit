import styles from './curriculum.module.scss';
import CurriculumItem from './curriculumitem';

const curriculumData = [
  {
    phase: 'Liftoff',
    title: 'This is where it begins.',
    description: 'You’ll unlearn, explore, and rewire how you think about design. ',
    bullets: [
      'Access full learning Episodes',
      'Personalized reviews + community support',
    ],
  },
  {
    phase: 'Ascent',
    title: 'Create Your Design Language.',
    description: 'Dive into real-world projects across branding, motion, UI, and more. \n\n Build your taste.',
    bullets: [
      'Explore across domains',
      'Build a portfolio that speaks',
      'Prepare for your first Orbit Interview',
    ],
  },

  {
    phase: 'Docking Bay',
    title: 'Earn Your Way Forward.',
    description: 'To enter the next phase, you’ll go through a short creative interview. \n\n Didn’t make it? No worries—get 3 more months of learning and come back stronger.',
  },

  {
    phase: 'Trajectory',
    title: 'Specialize Your Path.',
    description: 'Choose your domain—Product Design, Graphic Design, UI/UX, or Frontend Development. \n\n Get a personalized curriculum crafted to your strengths and goals.',
  },

  {
    phase: 'Touchdown',
    title: 'Live the Designer’s Life.',
    description: 'This is where it all comes together. \n\n Travel with us. Visit real brands, design for real spaces. \n\n Work on live briefs and meet the people behind the products.',
    bullets: [
      'Studio Trips & Field Work',
      'Brand Collab Projects',
      'Orbit Awards',
    ],
  },

];

export default function Curriculum() {
  return (
    <section className={styles.curriculum}>
      <span className={styles.line}></span>
      {curriculumData.map((item, index) => (
        <CurriculumItem key={index} index={index + 1} {...item} />
      ))}
    </section>
  );
}
