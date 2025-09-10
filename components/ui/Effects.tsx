
import React, { useState, useEffect } from 'react';

export const ConfettiEffect: React.FC = () => {
    const [pieces, setPieces] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: 100 }).map((_, i) => {
            const style: React.CSSProperties = {
                position: 'fixed',
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                top: '-20px',
                left: `${Math.random() * 100}vw`,
                animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s forwards`,
                borderRadius: '50%',
                opacity: 0,
            };
            return <div key={i} style={style} />;
        });
        setPieces(newPieces);
    }, []);

    return (
        <>
            <style>
                {`
                    @keyframes fall {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                    }
                `}
            </style>
            <div className="pointer-events-none">{pieces}</div>
        </>
    );
};

export const SparkleEffect: React.FC = () => {
    const [sparkles, setSparkles] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const newSparkles = Array.from({ length: 30 }).map((_, i) => {
            const style: React.CSSProperties = {
                position: 'fixed',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                animation: `sparkle 0.8s ease-out ${Math.random() * 0.5}s forwards`,
                transform: 'scale(0)',
                zIndex: 1000,
            };
            return (
                <div key={i} style={style}>
                    <svg viewBox="0 0 100 100" className="text-yellow-300 fill-current">
                        <path d="M50 0 L61.2 38.8 L100 50 L61.2 61.2 L50 100 L38.8 61.2 L0 50 L38.8 38.8 Z" />
                    </svg>
                </div>
            );
        });
        setSparkles(newSparkles);
    }, []);

    return (
        <>
            <style>
                {`
                    @keyframes sparkle {
                        0% { transform: scale(0) rotate(0deg); opacity: 1; }
                        50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
                        100% { transform: scale(0) rotate(360deg); opacity: 0; }
                    }
                `}
            </style>
            <div className="pointer-events-none">{sparkles}</div>
        </>
    );
};
