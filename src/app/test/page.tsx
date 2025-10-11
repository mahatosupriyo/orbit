'use client';
import { useScroll, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import Lenis from 'lenis';

export default function Home() {

  const container = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  }) 

  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <main ref={container} className="relative h-[200vh]">
      <Section1 scrollYProgress={scrollYProgress}/>
      <Section2 scrollYProgress={scrollYProgress}/>
    </main>
  );
}

interface SectionProps {
  scrollYProgress: import("framer-motion").MotionValue<number>;
}

const Section1 = ({ scrollYProgress }: SectionProps) => {

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -5])
  return (
    <motion.div
      style={{
      scale,
      rotate,
      background: "#C72626",
      color: "white",
      paddingBottom: "10vh",
      position: "sticky",
      top: 0,
      height: "100vh",
      fontSize: "3.5vw",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
      }}
      className="text-[3.5vw] flex flex-col items-center justify-center pb-[10vh]"
    >
      <p>Scroll Perspective</p>
      <div style={{ display: "flex", gap: "1rem" }}>
      <p>Section</p>
      <div style={{ position: "relative", width: "12.5vw" }}>
        <img
        src="https://images.unsplash.com/photo-1759852909538-57985f691821?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNXx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=700"
        alt="img"
        style={{ width: "100%", height: "auto" }}
        />
      </div>
      <p>Transition</p>
      </div>
    </motion.div>
  )
}

const Section2 = ({ scrollYProgress }: SectionProps) => {

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0])

  return (
    <motion.div
      style={{
      scale,
      rotate,
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      overflow: "hidden",
      aspectRatio: '16/9'
      }}
      
      className="relative h-screen"
    >
      <img
      src="https://images.unsplash.com/photo-1760015131516-a348939b0275?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=60&w=700"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </motion.div>
  )
}