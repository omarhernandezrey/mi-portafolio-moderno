'use client';

import React from 'react';
import styled from 'styled-components';
import { Github, Linkedin } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';

interface ModernInterestCardProps {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const ModernInterestCard: React.FC<ModernInterestCardProps> = ({ title, href, icon }) => {
  return (
    <StyledWrapper>
      <div 
        className="card cursor-pointer" 
        onClick={(e) => {
          // If the user clicked directly on one of the social links, don't open the main card link
          if (!(e.target as HTMLElement).closest('a.box')) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        <div className="background"></div>
        <div className="title-text">{title}</div>
        
        <div className="logo">
          {icon || (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.667 31.69" className="logo-svg">
              <path id="Path_6" data-name="Path 6" d="M12.827,1.628A1.561,1.561,0,0,1,14.31,0h2.964a1.561,1.561,0,0,1,1.483,1.628v11.9a9.252,9.252,0,0,1-2.432,6.852q-2.432,2.409-6.963,2.409T2.4,20.452Q0,18.094,0,13.669V1.628A1.561,1.561,0,0,1,1.483,0h2.98A1.561,1.561,0,0,1,5.947,1.628V13.191a5.635,5.635,0,0,0,.85,3.451,3.153,3.153,0,0,0,2.632,1.094,3.032,3.032,0,0,0,2.582-1.076,5.836,5.836,0,0,0,.816-3.486Z" transform="translate(0 0)" />
              <path id="Path_7" data-name="Path 7" d="M75.207,20.857a1.561,1.561,0,0,1-1.483,1.628h-2.98a1.561,1.561,0,0,1-1.483-1.628V1.628A1.561,1.561,0,0,1,70.743,0h2.98a1.561,1.561,0,0,1,1.483,1.628Z" transform="translate(-45.91 0)" />
              <path id="Path_8" data-name="Path 8" d="M0,80.018A1.561,1.561,0,0,1,1.483,78.39h26.7a1.561,1.561,0,0,1,1.483,1.628v2.006a1.561,1.561,0,0,1-1.483,1.628H1.483A1.561,1.561,0,0,1,0,82.025Z" transform="translate(0 -51.963)" />
            </svg>
          )}
        </div>
        
        <a 
          className="box box1" 
          href="https://github.com/omarhernandezrey" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span className="icon">
            <Github className="svg" />
          </span>
        </a>
        <a 
          className="box box2" 
          href="https://www.linkedin.com/in/omarhernandezrey/" 
          target="_blank" 
          rel="noopener noreferrer"
        > 
          <span className="icon">
            <Linkedin className="svg" />
          </span>
        </a>
        <a 
          className="box box3" 
          href="https://twitter.com/omarhernandezrey" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span className="icon">
            <FaXTwitter className="svg" />
          </span>
        </a>
        <div className="box box4" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    display: block;
    position: relative;
    width: 100%;
    height: 180px;
    background: var(--secondary-background-color);
    border-radius: 30px;
    overflow: hidden;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 7px 29px 0px;
    transition: all 1s ease-in-out;
    text-decoration: none;
    border: 1px solid color-mix(in srgb, var(--accent-color) 20%, transparent);
  }

  .background {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 100% 107%, var(--primary-color) 0%, color-mix(in srgb, var(--accent-color) 30%, transparent) 30%, transparent 100%);
    opacity: 0.2;
    transition: all 0.5s ease;
  }

  .title-text {
    position: absolute;
    top: 20px;
    left: 20px;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-color);
    z-index: 10;
    transition: all 0.6s ease-in-out;
  }

  .logo {
    position: absolute;
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    transition: all 0.6s ease-in-out;
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo .logo-svg {
    fill: var(--accent-color);
    width: 50px;
    height: 50px;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .icon .svg {
    stroke: rgba(255, 255, 255, 0.797);
    width: 100%;
    height: 100%;
    transition: all 0.5s ease-in-out;
  }

  .box {
    position: absolute;
    padding: 10px;
    text-align: right;
    background: color-mix(in srgb, var(--primary-color) 40%, transparent);
    backdrop-filter: blur(5px);
    border-top: 2px solid color-mix(in srgb, var(--accent-color) 60%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--accent-color) 30%, transparent);
    border-radius: 10% 13% 42% 0%/10% 12% 75% 0%;
    box-shadow: rgba(0, 0, 0, 0.3) -7px 7px 29px 0px;
    transform-origin: bottom left;
    transition: all 1s ease-in-out;
  }

  .box::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: all 0.5s ease-in-out;
  }

  .box:hover .svg {
    stroke: white;
  }

  .box1 {
    width: 70%;
    height: 70%;
    bottom: -70%;
    left: -70%;
  }

  .box1::before {
    background: radial-gradient(circle at 30% 107%, color-mix(in srgb, var(--accent-color) 60%, transparent) 0%, transparent 90%);
  }

  .box1:hover::before {
    opacity: 1;
  }

  .box1:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box2 {
    width: 50%;
    height: 50%;
    bottom: -50%;
    left: -50%;
    transition-delay: 0.2s;
  }

  .box2::before {
    background: radial-gradient(circle at 30% 107%, color-mix(in srgb, var(--primary-color) 80%, transparent) 0%, transparent 90%);
  }

  .box2:hover::before {
    opacity: 1;
  }

  .box2:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box3 {
    width: 30%;
    height: 30%;
    bottom: -30%;
    left: -30%;
    transition-delay: 0.4s;
  }

  .box3::before {
    background: radial-gradient(circle at 30% 107%, color-mix(in srgb, white 40%, transparent) 0%, transparent 90%);
  }

  .box3:hover::before {
    opacity: 1;
  }

  .box3:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box4 {
    width: 10%;
    height: 10%;
    bottom: -10%;
    left: -10%;
    transition-delay: 0.6s;
  }

  .card:hover {
    transform: scale(1.05);
    border-color: var(--accent-color);
    box-shadow: 0 15px 35px color-mix(in srgb, var(--accent-color) 20%, transparent);
  }
  
  .card:hover .background {
    opacity: 0.8;
  }

  .card:hover .box {
    bottom: -1px;
    left: -1px;
  }

  .card:hover .title-text {
    top: 15px;
    left: 15px;
  }

  .card:hover .logo {
    transform: translate(0, 0);
    bottom: 20px;
    right: 20px;
  }
`;

export default ModernInterestCard;