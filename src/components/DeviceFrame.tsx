// components/DeviceFrame.tsx
import React from "react";
import Image from "next/image";
import styles from "./DeviceFrame.module.css";

interface DeviceFrameProps {
  demo: string;
  demoTablet?: string; // Opcional, si no se proporciona usa demo
  demoMobile?: string; // Opcional, si no se proporciona usa demo
  title: string;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ 
  demo, 
  demoTablet, 
  demoMobile, 
  title 
}) => {
  return (
    <div className={styles.deviceFrameContainer}>
      
      {/* Desktop/Laptop */}
      <div className={styles.device}>
        <Image
          src="/images/laptop.png"
          alt="Laptop Mockup"
          className={styles.deviceImage}
          width={500}
          height={300}
          priority
        />
        <iframe
          src={demo}
          title={`${title} - Desktop Demo`}
          className={`${styles.deviceIframe} ${styles.desktopIframe}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      </div>

      {/* Tablet */}
      <div className={styles.device}>
        <Image
          src="/images/tablet.png"
          alt="Tablet Mockup"
          className={styles.deviceImage}
          width={300}
          height={200}
        />
        <iframe
          src={demoTablet || demo}
          title={`${title} - Tablet Demo`}
          className={`${styles.deviceIframe} ${styles.tabletIframe}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      </div>

      {/* Mobile */}
      <div className={styles.device}>
        <Image
          src="/images/mobile.png"
          alt="Mobile Mockup"
          className={styles.deviceImage}
          width={150}
          height={300}
        />
        <iframe
          src={demoMobile || demo}
          title={`${title} - Mobile Demo`}
          className={`${styles.deviceIframe} ${styles.mobileIframe}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      </div>

    </div>
  );
};

export default DeviceFrame;