// components/shared/Card.tsx - Mobile-first responsive design
import React from "react";
import Image from "next/image";
import technologyIcons from "../../config/technologyIcons";
import LinkedInShareButton from "./LinkedInShareButton";

interface CardProps {
  title: string;
  description: string;
  technologies: string[];
  repository: string;
  demo: string;
  category?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  technologies,
  repository,
  demo,
  category = "Web Development",
}) => {
  const projectData = {
    title,
    description,
    technologies,
    repository,
    demo,
    category,
  };

  return (
    <div className="relative w-full flex flex-col bg-transparent text-[var(--text-color)] rounded-lg z-10">
      {/* Dispositivos - Escala progresiva por breakpoint */}
      <div className="flex flex-col items-center justify-center scale-[0.55] xs:scale-75 sm:scale-90 md:scale-100 lg:scale-[1.15] xl:scale-[1.3] origin-center -mb-8 sm:-mb-12 md:-mb-16 lg:-mb-20">
        {/* Desktop/Laptop */}
        <div
          className="relative flex-shrink-0"
          style={{ width: "250px", height: "200px" }}
        >
          <Image
            src="/images/laptop.png"
            alt="Laptop"
            width={250}
            height={200}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute overflow-hidden"
            style={{ top: "20px", left: "8px", right: "4px", bottom: "4px" }}
          >
            <iframe
              src={demo}
              className="border-none"
              title={`${title} Desktop`}
              style={{
                width: "1570px",
                height: "1050px",
                transform: "scale(0.15)",
                transformOrigin: "top left",
                pointerEvents: "auto",
              }}
            />
          </div>
        </div>

        {/* Tablet y Mobile */}
        <div
          className="flex justify-center items-center gap-36"
          style={{ width: "420px", marginTop: "-72px" }}
        >
          {/* Tablet */}
          <div
            className="relative flex-shrink-0"
            style={{ width: "160px", height: "116px" }}
          >
            <Image
              src="/images/tablet.png"
              alt="Tablet"
              width={160}
              height={116}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute overflow-hidden"
              style={{ top: "6px", left: "3px", right: "3px", bottom: "10px" }}
            >
              <iframe
                src={demo}
                className="border-none bg-transparent"
                title={`${title} Tablet`}
                style={{
                  width: "1180px",
                  height: "761px",
                  transform: "scale(0.13)",
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                }}
              />
            </div>
          </div>

          {/* Mobile phone */}
          <div
            className="relative flex-shrink-0"
            style={{ width: "36px", height: "76px" }}
          >
            <Image
              src="/images/mobile.png"
              alt="Mobile"
              width={36}
              height={76}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute overflow-hidden"
              style={{ top: "4px", left: "2px", right: "2px", bottom: "4px" }}
            >
              <iframe
                src={demo}
                className="border-none"
                title={`${title} Mobile`}
                style={{
                  width: "334px",
                  height: "640px",
                  transform: "scale(0.1)",
                  transformOrigin: "top left",
                  pointerEvents: "auto",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del proyecto */}
      <div className="mt-4 sm:mt-20 md:mt-24 lg:mt-32 xl:mt-44 text-center px-2 sm:px-4">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--accent-color)] leading-tight">
          {title}
        </h3>
        <p className="text-[var(--muted-color)] text-xs sm:text-sm mt-2 leading-relaxed">
          {description}
        </p>

        {/* Tecnologías */}
        {technologies && technologies.length > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {technologies.slice(0, 8).map((tech, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center cursor-pointer"
                >
                  {technologyIcons[tech] ? (
                    <div className="transform transition-transform group-hover:scale-110 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center">
                      <div className="scale-75 sm:scale-90 origin-center">
                        {technologyIcons[tech]}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[var(--accent-color)] text-[0.65rem] sm:text-xs font-medium px-2 py-0.5 bg-[var(--secondary-background-color)] rounded">
                      {tech}
                    </span>
                  )}
                  <span className="absolute bottom-[-24px] opacity-0 group-hover:opacity-100 group-hover:translate-y-[-5px] bg-[var(--secondary-background-color)] text-[var(--text-color)] text-[0.6rem] px-1.5 py-0.5 rounded transition-all whitespace-nowrap z-10">
                    {tech}
                  </span>
                </div>
              ))}
              {technologies.length > 8 && (
                <span className="text-[var(--muted-color)] text-[0.65rem] sm:text-xs self-center">
                  +{technologies.length - 8} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
          <a
            href={repository}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-color)] bg-[var(--secondary-background-color)] border border-[var(--muted-color)] rounded-lg hover:bg-[var(--muted-color)] transition duration-200 w-full sm:w-auto justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.372 0 0 5.372 0 12c0 5.303 3.438 9.8 8.207 11.387.599.113.793-.26.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.612-4.042-1.612-.546-1.385-1.333-1.753-1.333-1.753-1.09-.745.083-.73.083-.73 1.204.084 1.838 1.236 1.838 1.236 1.07 1.833 2.805 1.303 3.49.997.107-.775.418-1.303.761-1.603-2.665-.303-5.466-1.333-5.466-5.93 0-1.31.469-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.45 11.45 0 013.003-.403c1.019.005 2.047.138 3.002.403 2.291-1.552 3.298-1.23 3.298-1.23.653 1.653.242 2.873.118 3.176.768.84 1.236 1.912 1.236 3.222 0 4.61-2.804 5.625-5.475 5.922.43.37.815 1.1.815 2.217 0 1.603-.015 2.895-.015 3.286 0 .32.192.694.8.576C20.565 21.795 24 17.298 24 12c0-6.628-5.372-12-12-12z" />
            </svg>
            GitHub
          </a>

          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-color)] bg-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-hover-color)] transition duration-300 w-full sm:w-auto text-center"
          >
            Ver Demo
          </a>
        </div>

        {/* Botón LinkedIn */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <LinkedInShareButton
            project={projectData}
            className="w-full max-w-[240px] sm:max-w-[280px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
