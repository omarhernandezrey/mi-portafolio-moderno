"use client";
import React from "react";
import Image from "next/image";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  avatar,
}) => {
  return (
    <blockquote className="bg-[var(--secondary-background-color)] p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <p className="text-[var(--text-color)] italic mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center">
        <Image
          src={avatar}
          alt={`${author} avatar`}
          width={48}
          height={48}
          className="rounded-full mr-4 object-cover"
        />
        <div>
          <cite className="text-[var(--accent-color)] font-semibold">{author}</cite>
          <span className="block text-[var(--muted-color)] text-sm">{role}</span>
        </div>
      </div>
    </blockquote>
  );
};

export default TestimonialCard;
