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
            <div className="social-grid">
              <div className="social-cell">
                <div className="social-icon">
                   {technologyIcons[title] || <span>★</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="scan-effect" />
          <div className="rivet rivet-tl" />
          <div className="rivet rivet-tr" />
          <div className="rivet rivet-bl" />
          <div className="rivet rivet-br" />
        </div>
        <div className="type-accent">SYS//INTEREST_{index + 1}</div>
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
    height: 110px;
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
    border: 8px solid #000;
    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    overflow: hidden;
  }

  .brutalist-container:hover .concrete-block {
    transform: translate(-12px, -12px) rotate(-2deg);
    box-shadow:
      12px 12px 0 #333,
      24px 24px 0 #666,
      36px 36px 0 #999;
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
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-shadow:
      2px 2px 0 #333;
    text-align: center;
    padding: 0 15px;
  }

  .brutalist-container:hover .title-text {
    opacity: 0;
    transform: translateY(-40px) rotateX(90deg) scale(0.3);
    filter: blur(8px);
  }

  .social-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
    opacity: 0;
    transform: translateY(40px) rotateX(-90deg) scale(1.3);
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .brutalist-container:hover .social-grid {
    opacity: 1;
    transform: translateY(0) rotateX(0deg) scale(1);
  }

  .social-cell {
    position: relative;
    background: #fff;
    border: 4px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    overflow: hidden;
    width: 60px;
    height: 60px;
  }

  .social-cell:hover {
    background: #000;
    transform: scale(1.1) rotate(5deg);
    border-color: #fff;
    z-index: 10;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.3);
  }

  .social-cell:hover .social-icon {
    color: #fff;
    transform: scale(1.2) rotate(-5deg);
  }

  .social-icon {
    font-size: 28px;
    color: #000;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Concrete slab backgrounds */
  .slab-bg {
    position: absolute;
    background: #ddd;
    border: 4px solid #000;
    z-index: -1;
    transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .slab-1 {
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);
    height: calc(100% - 20px);
  }

  .slab-2 {
    top: 20px;
    left: 20px;
    width: calc(100% - 40px);
    height: calc(100% - 40px);
  }

  .brutalist-container:hover .slab-1 {
    transform: translate(20px, 20px) rotate(1deg);
  }

  .brutalist-container:hover .slab-2 {
    transform: translate(-10px, 30px) rotate(-1deg);
  }

  /* Industrial corner brackets */
  .corner-bracket {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 4px solid #000;
    background: #fff;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .bracket-tl {
    top: -10px;
    left: -10px;
    border-right: none;
    border-bottom: none;
  }

  .bracket-tr {
    top: -10px;
    right: -10px;
    border-left: none;
    border-bottom: none;
  }

  .bracket-bl {
    bottom: -10px;
    left: -10px;
    border-right: none;
    border-top: none;
  }

  .bracket-br {
    bottom: -10px;
    right: -10px;
    border-left: none;
    border-top: none;
  }

  .brutalist-container:hover .corner-bracket {
    transform: scale(1.5);
    background: #000;
    border-color: #fff;
  }

  /* Typography accent */
  .type-accent {
    position: absolute;
    top: -30px;
    left: 0;
    font-family: "JetBrains Mono", monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #000;
    transition: all 0.4s ease;
    opacity: 0;
  }

  .brutalist-container:hover .type-accent {
    opacity: 1;
    transform: translateY(5px);
  }

  /* Industrial rivets */
  .rivet {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #000;
    border-radius: 50%;
    border: 2px solid #333;
    transition: all 0.3s ease;
  }

  .rivet-tl { top: 10px; left: 10px; }
  .rivet-tr { top: 10px; right: 10px; }
  .rivet-bl { bottom: 10px; left: 10px; }
  .rivet-br { bottom: 10px; right: 10px; }

  .brutalist-container:hover .rivet {
    background: #fff;
    transform: scale(1.5);
  }

  /* Scan line effect */
  .scan-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, transparent, #fff, transparent);
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0.8;
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
        rgba(255, 255, 255, 0.3) 21%,
        rgba(255, 255, 255, 0.3) 34%,
        transparent 35%,
        transparent
      ),
      linear-gradient(
        0deg,
        transparent 24%,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.05) 26%,
        transparent 27%,
        transparent 74%,
        rgba(255, 255, 255, 0.05) 75%,
        rgba(255, 255, 255, 0.05) 76%,
        transparent 77%,
        transparent
      );
    pointer-events: none;
  }
`;

export default BrutalistInterestCard;