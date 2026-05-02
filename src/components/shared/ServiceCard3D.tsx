"use client";

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ServiceCard3DProps {
  title: string;
  description: string;
  features: string[];
  priceMin: number;
  priceMax: number;
  currency: string;
}

const ServiceCard3D: React.FC<ServiceCard3DProps> = ({
  title,
  description,
  features,
  priceMin,
  priceMax,
  currency,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <StyledWrapper>
      <motion.div
        className="parent"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          className="card"
          animate={isHovered ? { rotateX: 20, rotateY: 20 } : { rotateX: 0, rotateY: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Logo/Icon Container */}
          <div className="logo">
            <span className="circle circle1" />
            <span className="circle circle2" />
            <span className="circle circle3" />
            <span className="circle circle4" />
            <span className="circle circle5">
              <div className="icon-container">
                {/* Icon SVG renderizado */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="svg"
                >
                  {/* Icono dinámico basado en tipo de servicio */}
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
            </span>
          </div>

          <div className="glass" />

          <div className="content">
            <span className="title">{title.toUpperCase()}</span>
            <span className="text">{description}</span>

            {/* Características */}
            <div className="features-list">
              {features.slice(0, 3).map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="feature-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <span className="dot" />
                  <span className="feature-text">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bottom">
            <div className="price-container">
              <span className="price-label">Desde</span>
              <span className="price">
                {currency} ${priceMin}-${priceMax}
              </span>
            </div>

            <div className="view-more">
              <button className="view-more-button">Cotizar</button>
              <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .parent {
    width: 100%;
    aspect-ratio: 1;
    perspective: 1000px;
  }

  .card {
    height: 100%;
    border-radius: 30px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
    transition: all 0.5s ease-in-out;
    transform-style: preserve-3d;
    box-shadow: rgba(0, 0, 0, 0.3) 0px 25px 50px -15px, rgba(0, 0, 0, 0.15) 0px 8px 16px 0px;
    position: relative;
    overflow: hidden;
  }

  .glass {
    transform-style: preserve-3d;
    position: absolute;
    inset: 8px;
    border-radius: 30px;
    border-top-right-radius: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.25) 100%);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    transform: translate3d(0px, 0px, 25px);
    border-left: 1px solid rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.4);
    border-right: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.5s ease-in-out;
  }

  .content {
    padding: 32px 28px 0px 28px;
    transform: translate3d(0, 0, 26px);
    position: relative;
    z-index: 2;
  }

  .content .title {
    display: block;
    color: #ffffff;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 1.2px;
    margin-bottom: 10px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .content .text {
    display: block;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 15px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .features-list {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 2px solid rgba(255, 255, 255, 0.3);
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 8px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #ffffff;
    flex-shrink: 0;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
  }

  .feature-text {
    font-size: 13px;
  }

  .bottom {
    padding: 14px 18px;
    transform-style: preserve-3d;
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translate3d(0, 0, 26px);
    background: rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .price-container {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .price-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .price {
    font-size: 16px;
    font-weight: 900;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .view-more {
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease-in-out;
  }

  .view-more:hover {
    transform: translate3d(0, 0, 10px) scale(1.05);
  }

  .view-more-button {
    background: none;
    border: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    cursor: pointer;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .view-more .svg {
    fill: none;
    stroke: #ffffff;
    stroke-width: 2.5px;
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .logo {
    position: absolute;
    right: 0;
    top: 0;
    transform-style: preserve-3d;
    z-index: 3;
  }

  .logo .circle {
    display: block;
    position: absolute;
    aspect-ratio: 1;
    border-radius: 50%;
    top: 0;
    right: 0;
    box-shadow: rgba(0, 0, 0, 0.2) -10px 10px 20px 0px;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.5s ease-in-out;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .logo .circle1 {
    width: 150px;
    transform: translate3d(0, 0, 20px);
    top: 4px;
    right: 4px;
  }

  .logo .circle2 {
    width: 125px;
    transform: translate3d(0, 0, 40px);
    top: 6px;
    right: 6px;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    transition-delay: 0.4s;
  }

  .logo .circle3 {
    width: 100px;
    transform: translate3d(0, 0, 60px);
    top: 10px;
    right: 10px;
    transition-delay: 0.8s;
  }

  .logo .circle4 {
    width: 75px;
    transform: translate3d(0, 0, 80px);
    top: 15px;
    right: 15px;
    transition-delay: 1.2s;
  }

  .logo .circle5 {
    width: 50px;
    transform: translate3d(0, 0, 100px);
    top: 20px;
    right: 20px;
    display: grid;
    place-content: center;
    transition-delay: 1.6s;
    background: rgba(255, 255, 255, 0.3);
    box-shadow: rgba(0, 0, 0, 0.25) -6px 6px 15px 0px;
  }

  .icon-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .logo .circle5 .svg {
    width: 22px;
    height: 22px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .parent:hover .card {
    transform: rotate3d(1, 1, 0, 20deg);
    box-shadow: rgba(0, 0, 0, 0.25) 20px 40px 30px -30px, rgba(0, 0, 0, 0.15) 0px 15px 25px 0px;
  }

  .parent:hover .card .logo .circle2 {
    transform: translate3d(0, 0, 60px);
  }

  .parent:hover .card .logo .circle3 {
    transform: translate3d(0, 0, 80px);
  }

  .parent:hover .card .logo .circle4 {
    transform: translate3d(0, 0, 100px);
  }

  .parent:hover .card .logo .circle5 {
    transform: translate3d(0, 0, 120px);
  }

  @media (max-width: 640px) {
    .parent {
      min-height: 320px;
    }

    .content {
      padding: 20px 15px 0px 15px;
    }

    .content .title {
      font-size: 14px;
    }

    .content .text {
      font-size: 12px;
    }

    .bottom {
      bottom: 10px;
      left: 10px;
      right: 10px;
      padding: 10px;
    }

    .price {
      font-size: 12px;
    }
  }
`;

export default ServiceCard3D;
