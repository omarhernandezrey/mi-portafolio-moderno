"use client";

import React from 'react';
import styled from 'styled-components';
import technologyIcons from "../../config/technologyIcons";
import { motion } from "framer-motion";

interface BrutalistInterestCardProps {
  title: string;
  href: string;
  index: number;
}

const BrutalistInterestCard: React.FC<BrutalistInterestCardProps> = ({ title, href, index }) => {
  return (
    <StyledWrapper>
      <motion.a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
        }}
        viewport={{ once: true }}
        className="brutalist-container"
      >
        <div className="slab-bg slab-1" />
        <div className="slab-bg slab-2" />
        <div className="concrete-block">
          <div className="concrete-texture" />
          <div className="paper-texture" />
          <div className="main-content">
            <div className="title-text">{title}</div>
            <div className="interest-icon-box">
              <div className="icon-cell">
                {technologyIcons[title] || <span className="text-4xl">★</span>}
              </div>
            </div>
          </div>
          <div className="scan-effect" />
          <div className="rivet" />
          <div className="rivet" />
          <div className="rivet" />
          <div className="rivet" />
        </div>
        <div className="type-accent">INT//CORE_{index + 1}</div>
        <div className="corner-bracket bracket-tl" />
        <div className="corner-bracket bracket-tr" />
        <div className="corner-bracket bracket-bl" />
        <div className="corner-bracket bracket-br" />
      </motion.a>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .brutalist-container {
    position: relative;
    width: 100%;
    height: 120px;
    cursor: pointer;
    display: block;
  }

  .concrete-block {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    border: 4px solid #000;
    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    overflow: hidden;
  }

  .brutalist-container:hover .concrete-block {
    transform: translate(-8px, -8px) rotate(-1deg);
    box-shadow:
      8px 8px 0 var(--primary-color),
      16px 16px 0 var(--accent-color);
  }

  .concrete-texture {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
        45deg,
        #000 0px,
        #000 2px,
        #111 2px,
        #111 4px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent 0px,
        transparent 8px,
        rgba(255, 255, 255, 0.05) 8px,
        rgba(255, 255, 255, 0.05) 10px
      );
    opacity: 0.3;
  }

  .main-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .title-text {
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-shadow:
      2px 2px 0 #333;
    padding: 0 10px;
    text-align: center;
  }

  .brutalist-container:hover .title-text {
    opacity: 0;
    transform: translateY(-40px) rotateX(90deg) scale(0.3);
    filter: blur(8px);
  }

  .interest-icon-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(40px) rotateX(-90deg) scale(1.3);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .brutalist-container:hover .interest-icon-box {
    opacity: 1;
    transform: translateY(0) rotateX(0deg) scale(1);
  }

  .icon-cell {
    position: relative;
    background: #fff;
    border: 4px solid #000;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    overflow: hidden;
    color: #000;
    font-size: 32px;
  }

  .brutalist-container:hover .icon-cell {
    background: var(--primary-color);
    transform: scale(1.1) rotate(5deg);
    border-color: #fff;
    z-index: 10;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
    color: #fff;
  }

  /* Concrete slab backgrounds */
  .slab-bg {
    position: absolute;
    background: #333;
    border: 2px solid #000;
    z-index: -1;
    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .slab-1 {
    top: 10px;
    left: 10px;
    width: 100%;
    height: 100%;
  }

  .slab-2 {
    top: 20px;
    left: 20px;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
  }

  .brutalist-container:hover .slab-1 {
    transform: translate(10px, 10px) rotate(1deg);
    background: var(--primary-color);
    opacity: 0.5;
  }

  .brutalist-container:hover .slab-2 {
    transform: translate(-5px, 15px) rotate(-1deg);
    background: var(--accent-color);
    opacity: 0.3;
  }

  /* Industrial corner brackets */
  .corner-bracket {
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid var(--accent-color);
    background: transparent;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    opacity: 0.5;
  }

  .bracket-tl {
    top: -5px;
    left: -5px;
    border-right: none;
    border-bottom: none;
  }

  .bracket-tr {
    top: -5px;
    right: -5px;
    border-left: none;
    border-bottom: none;
  }

  .bracket-bl {
    bottom: -5px;
    left: -5px;
    border-right: none;
    border-top: none;
  }

  .bracket-br {
    bottom: -5px;
    right: -5px;
    border-left: none;
    border-top: none;
  }

  .brutalist-container:hover .corner-bracket {
    transform: scale(1.5);
    background: var(--primary-color);
    border-color: #fff;
    opacity: 1;
  }

  /* Typography accent */
  .type-accent {
    position: absolute;
    top: -20px;
    left: 0;
    font-family: var(--font-geist-mono), monospace;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: 2px;
    color: var(--accent-color);
    transition: all 0.4s ease;
    opacity: 0;
  }

  .brutalist-container:hover .type-accent {
    opacity: 1;
    transform: translateY(2px);
  }

  /* Industrial rivets */
  .rivet {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #222;
    border-radius: 50%;
    border: 1px solid #444;
    transition: all 0.3s ease;
  }

  .rivet:nth-child(5) {
    top: 5px;
    left: 5px;
  }
  .rivet:nth-child(6) {
    top: 5px;
    right: 5px;
  }
  .rivet:nth-child(7) {
    bottom: 5px;
    left: 5px;
  }
  .rivet:nth-child(8) {
    bottom: 5px;
    right: 5px;
  }

  .brutalist-container:hover .rivet {
    background: #fff;
    transform: scale(1.2);
  }

  /* Scan line effect */
  .scan-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0.5;
  }

  .brutalist-container:hover .scan-effect {
    left: 100%;
  }

  /* Paper texture overlay */
  .paper-texture {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
        circle at 20% 50%,
        transparent 20%,
        rgba(255, 255, 255, 0.02) 21%,
        rgba(255, 255, 255, 0.02) 34%,
        transparent 35%,
        transparent
      );
    pointer-events: none;
  }
`;

export default BrutalistInterestCard;