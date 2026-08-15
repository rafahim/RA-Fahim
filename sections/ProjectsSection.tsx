'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';
import { useProjectCards } from '../hooks/useContent';
import { projects as fallbackProjects } from '../lib/data';
import type { ProjectWithImages } from '../types/content.types';

interface DisplayProject {
  number: string;
  category: string;
  name: string;
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
        className={`${className} bg-[#0C2B4D] border border-[#CFE8FB]/10`}
        style={style}
        aria-hidden
      />
    );
  }

  return <img src={src} alt={alt} loading="lazy" className={className} style={style} />;
}

interface ProjectCardProps {
  project: DisplayProject;
  index: number;
  totalCards: number;
}

function ProjectCard({ project, index, totalCards }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={cardRef}
      className="sticky top-24 md:top-32 h-[85vh]"
      style={{ top: `${index * 28 + 96}px` }}
    >
      <motion.div
        style={{ scale }}
        className="h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#CFE8FB] bg-[#071B33] p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8"
      >
        <div className="flex items-center gap-4 sm:gap-6 md:gap-10 flex-wrap">
          <span
            className="font-black text-[#CFE8FB] leading-none"
            style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
          >
            {project.number}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[#CFE8FB] uppercase tracking-widest text-xs sm:text-sm opacity-60">
              {project.category}
            </span>
            <span
              className="text-[#CFE8FB] font-medium uppercase"
              style={{ fontSize: 'clamp(1.25rem, 3vw, 2.5rem)' }}
            >
              {project.name}
            </span>
          </div>
          <div className="ml-auto">
            <LiveProjectButton href={project.liveUrl} />
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 flex-1 min-h-0">
          <div className="flex flex-col gap-3 sm:gap-4 w-[40%]">
            <PreviewImage
              src={project.col1Image1}
              alt={`${project.name} preview 1`}
              className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <PreviewImage
              src={project.col1Image2}
              alt={`${project.name} preview 2`}
              className="w-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>
          <div className="w-[60%]">
            <PreviewImage
              src={project.col2Image}
              alt={`${project.name} preview 3`}
              className="w-full h-full object-cover rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const { data, loading } = useProjectCards();

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
      className="relative bg-[#071B33] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-10"
    >
      <FadeIn>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-16 sm:mb-20 md:mb-28"
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
          />
        ))}
      </div>
    </section>
  );
}
