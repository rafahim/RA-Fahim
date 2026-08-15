'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import CornerBrackets from '../components/CornerBrackets';
import { useProjectCards } from '../hooks/useContent';
import { projects as fallbackProjects } from '../lib/data';
import type { ProjectWithImages } from '../types/content.types';

interface DisplayProject {
  number: string;
  category: string;
  name: string;
  year?: number | null;
  col1Image1: string | null;
  col1Image2: string | null;
  col2Image: string | null;
  liveUrl?: string | null;
}

/**
 * Maps a CMS project + its ordered gallery onto the three image slots the
 * card layout expects: the two stacked images on the left come from the
 * gallery, the large image on the right is the project's featured image
 * (falling back to gallery images if either is missing).
 */
function toDisplayProjects(cmsProjects: ProjectWithImages[]): DisplayProject[] {
  return cmsProjects.map((project, index) => {
    const gallery = project.images;
    return {
      number: String(index + 1).padStart(2, '0'),
      category: project.category,
      name: project.name,
      year: project.year,
      col1Image1: gallery[0]?.imageUrl ?? project.featuredImage ?? null,
      col1Image2: gallery[1]?.imageUrl ?? gallery[0]?.imageUrl ?? project.featuredImage ?? null,
      col2Image: project.featuredImage ?? gallery[0]?.imageUrl ?? null,
      liveUrl: project.projectUrl,
    };
  });
}

interface PreviewImageProps {
  src: string | null;
  alt: string;
  className: string;
  style?: React.CSSProperties;
}

/** Renders the preview image, or a quiet placeholder block if a slot has no image yet. */
function PreviewImage({ src, alt, className, style }: PreviewImageProps) {
  if (!src) {
    return (
      <div
        className={`${className} bg-[#15151B] border border-[#F3F1EA]/10`}
        style={style}
        aria-hidden
      />
    );
  }

  return (
    <div className={`${className} overflow-hidden`} style={style}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
      />
    </div>
  );
}

interface ProjectCardProps {
  project: DisplayProject;
  index: number;
  totalCards: number;
  isMobile: boolean;
}

function ProjectCard({ project, index, totalCards, isMobile }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);
  // Smoothing the scroll-driven scale through a spring turns the stacking
  // motion from a literal 1:1 scrollbar mapping into something that feels
  // like it has weight and settles -- premium rather than mechanical.
  const scale = useSpring(rawScale, { stiffness: 300, damping: 40, mass: 0.5 });
  // A subtle parallax on the large preview image -- it drifts slightly
  // slower than the card itself, adding depth without competing with the
  // stacking motion.
  const rawParallax = useTransform(scrollYProgress, [0, 1], [0, -22]);
  const imageParallax = useSpring(rawParallax, { stiffness: 300, damping: 40 });
  const depth = 18 + index * 6;

  // Tighter stacking offsets on mobile -- the desktop increment (28px per
  // card, 85vh tall cards) pushes later cards mostly off-screen on short
  // viewports before the user can see them stack.
  const topOffset = isMobile ? index * 14 + 72 : index * 28 + 96;

  return (
    <div
      ref={cardRef}
      className="sticky h-[72vh] sm:h-[80vh] md:h-[85vh]"
      style={{ top: `${topOffset}px` }}
    >
      <motion.div
        style={{
          scale: prefersReducedMotion ? 1 : scale,
          boxShadow: `0 ${depth}px ${depth * 3.2}px -${depth * 0.6}px rgba(2,2,4,0.65)`,
        }}
        className="group relative h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border border-white/12 bg-[#0b0b0f] p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 transition-colors duration-500 ease-out hover:border-[#8B7CF6]/50"
      >
        <CornerBrackets
          size={20}
          color="rgba(243,241,234,0.5)"
          className="m-5 sm:m-7 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="flex items-center gap-4 sm:gap-6 md:gap-10 flex-wrap">
          <span
            className="font-black text-[#F3F1EA] leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
          >
            {project.number}
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="font-hud text-[10px] sm:text-xs text-[#F3F1EA]/45">
              {project.category.toUpperCase()}
              {project.year ? ` · ${project.year}` : ''} · {project.number}/{String(totalCards).padStart(2, '0')}
            </span>
            <span
              className="text-[#F3F1EA] font-medium uppercase"
              style={{ fontSize: 'clamp(1.25rem, 3vw, 2.5rem)' }}
            >
              {project.name}
            </span>
          </div>
          <div className="ml-auto">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest text-[#F3F1EA] transition-all duration-300 ease-out hover:border-[#8B7CF6]/60 hover:bg-white/[0.06] hover:scale-[1.03] active:scale-[0.97]"
              >
                Live Project
                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            ) : (
              <button className="rounded-full border border-white/15 px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-medium uppercase tracking-widest text-[#F3F1EA]/40">
                Live Project
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 w-[40%]">
            <PreviewImage
              src={project.col1Image1}
              alt={`${project.name} preview 1`}
              className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <PreviewImage
              src={project.col1Image2}
              alt={`${project.name} preview 2`}
              className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>
          <motion.div
            className="w-[60%]"
            style={{ y: prefersReducedMotion ? 0 : imageParallax }}
          >
            <PreviewImage
              src={project.col2Image}
              alt={`${project.name} preview 3`}
              className="w-full h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const { data, loading } = useProjectCards();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 640);
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile, { passive: true });
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // While loading, when Supabase isn't configured, or when there are no
  // published projects yet, fall back to the static sample projects — same
  // strategy as ServicesSection — so the section (and its scroll-driven
  // animations) is never blank or broken for a visitor.
  const displayProjects: DisplayProject[] =
    !loading && data && data.length > 0 ? toDisplayProjects(data) : fallbackProjects;

  const totalCards = displayProjects.length;

  return (
    <section
      id="projects"
      className="relative bg-[#0A0A0D] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-10"
    >
      <FadeIn className="flex flex-col items-center gap-4 mb-16 sm:mb-20 md:mb-28">
        <span className="font-hud text-[10px] sm:text-xs text-[#F3F1EA]/45">
          {'// SELECTED WORK'}
        </span>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Project
        </h2>
      </FadeIn>

      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {displayProjects.map((project, i) => (
          <ProjectCard
            key={`${project.number}-${project.name}`}
            project={project}
            index={i}
            totalCards={totalCards}
            isMobile={isMobile}
          />
        ))}
      </div>
    </section>
  );
}
