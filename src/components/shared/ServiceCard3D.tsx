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

            {/* Característica principal */}
            {features.length > 0 && (
              <div className="features-list">
                <div className="feature-item">
                  <span className="dot" />
                  <span className="feature-text">{features[0]}</span>
                </div>
              </div>
            )}
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
    box-shadow: rgba(0, 0, 0, 0.2) 0px 20px 40px -20px, rgba(0, 0, 0, 0.1) 0px 0px 20px 0px;
    position: relative;
    overflow: hidden;
  }

  .glass {
    transform-style: preserve-3d;
    position: absolute;
    inset: 8px;
    border-radius: 30px;
    border-top-right-radius: 100%;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0.3) 100%);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
    transform: translate3d(0px, 0px, 25px);
    border-left: 1px solid rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.7);
    transition: all 0.5s ease-in-out;
  }

  .content {
    padding: 30px 25px 0px 25px;
    transform: translate3d(0, 0, 26px);
    position: relative;
    z-index: 2;
  }

  .content .title {
    display: block;
    color: #ffffff;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: 2px;
    margin-bottom: 10px;
    text-shadow: 0 3px 10px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25);
    padding: 8px 12px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.15);
  }

  .content .text {
    display: block;
    color: rgba(255, 255, 255, 0.95);
    font-size: 13.5px;
    line-height: 1.6;
    margin-bottom: 15px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .features-list {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #ffffff;
    flex-shrink: 0;
  }

  .feature-text {
    font-size: 12px;
  }

  .bottom {
    padding: 12px 15px;
    transform-style: preserve-3d;
    position: absolute;
    bottom: 15px;
    left: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translate3d(0, 0, 26px);
  }

  .price-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .price-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .price {
    font-size: 15px;
    font-weight: 900;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .view-more {
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease-in-out;
  }

  .view-more:hover {
    transform: translate3d(0, 0, 10px);
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
    width: 14px;
    height: 14px;
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
    box-shadow: rgba(0, 0, 0, 0.15) -8px 8px 15px 0px;
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.5s ease-in-out;
  }

  .logo .circle1 {
    width: 130px;
    transform: translate3d(0, 0, 20px);
    top: 6px;
    right: 6px;
  }

  .logo .circle2 {
    width: 110px;
    transform: translate3d(0, 0, 40px);
    top: 8px;
    right: 8px;
    -webkit-backdrop-filter: blur(1px);
    backdrop-filter: blur(1px);
    transition-delay: 0.4s;
  }

  .logo .circle3 {
    width: 90px;
    transform: translate3d(0, 0, 60px);
    top: 13px;
    right: 13px;
    transition-delay: 0.8s;
  }

  .logo .circle4 {
    width: 70px;
    transform: translate3d(0, 0, 80px);
    top: 18px;
    right: 18px;
    transition-delay: 1.2s;
  }

  .logo .circle5 {
    width: 50px;
    transform: translate3d(0, 0, 100px);
    top: 23px;
    right: 23px;
    display: grid;
    place-content: center;
    transition-delay: 1.6s;
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
    width: 20px;
    height: 20px;
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
