"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });
    const [isMobile, setIsMobile] = React.useState(false);

    // Responsive scaling to fit fixed 1200px layout into smaller screens
    const [scaleFactor, setScaleFactor] = React.useState(1);

    React.useEffect(() => {
        const checkMobile = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            // Base width is 1200px (fixed tablet size) plus some margin
            // We scale down if viewport is smaller than 1280px
            if (width < 1280) {
                setScaleFactor(width / 1280);
            } else {
                setScaleFactor(1);
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div
            className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 overflow-visible"
            ref={containerRef}
        >
            <div
                // Apply the responsive scale factor here to fit the fixed content
                className="py-10 md:py-40 w-full relative flex flex-col items-center"
                style={{
                    perspective: "1000px",
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: "center top",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }: any) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className="div max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    translate,
    children,
}: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            // Fixed width 900px and fixed height 1300px (Portrait Mode)
            className="max-w-[900px] w-[900px] -mt-12 mx-auto h-[1300px] border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl flex-shrink-0"
        >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-[#f5f5f5] dark:bg-[#18181b] p-4">
                {children}
            </div>
        </motion.div>
    );
};
