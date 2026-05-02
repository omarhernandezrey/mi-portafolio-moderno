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
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.6) 100%);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    transform: translate3d(0px, 0px, 25px);
    border-left: 1px solid rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
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
    color: white;
    font-weight: 900;
    font-size: 16px;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .content .text {
    display: block;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 15px;
  }

  .features-list {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    flex-shrink: 0;
  }

  .feature-text {
    font-size: 11px;
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
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .price {
    font-size: 14px;
    font-weight: 900;
    color: white;
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
    color: white;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
  }

  .view-more .svg {
    fill: none;
    stroke: white;
    stroke-width: 2px;
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
