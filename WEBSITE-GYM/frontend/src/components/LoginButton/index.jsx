import React from "react";

const Button = () => {
    return (
        <>
            <style>{`
        .styled-wrapper button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 10px;
          color: white;
          text-shadow: 2px 2px rgb(116, 116, 116);
          text-transform: uppercase;
          cursor: pointer;
          border: solid 2px black;
          letter-spacing: 1px;
          font-weight: 600;
          font-size: 17px;
          background-color: hsl(49deg 98% 60%);
          border-radius: 50px;
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
          transform: scale(1.15);
        }

        .styled-wrapper button:active {
          transform: scale(0.9);
          transition: all 100ms ease;
        }

        .styled-wrapper button svg {
          transition: all 0.5s ease;
          z-index: 2;
        }

        .styled-wrapper .play {
          transition: all 0.5s ease;
          transition-delay: 300ms;
        }

        .styled-wrapper button:hover svg {
          transform: scale(3) translate(90%);
        }

        .styled-wrapper .now {
          position: absolute;
          left: 0;
          transform: translateX(-100%);
          transition: all 0.5s ease;
          z-index: 2;
        }

        .styled-wrapper button:hover .now {
          transform: translateX(10px);
          transition-delay: 300ms;
        }

        .styled-wrapper button:hover .play {
          transform: translateX(200%);
          transition-delay: 300ms;
        }
        
        .styled-wrapper img{
            transform: scale(1.7);
            transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
            z-index: 2;
        }

        .styled-wrapper button:hover img{
            transform: scale(3) translate(90%);
        }
      `}</style>

            {/* button images */}
            <div className="styled-wrapper">
                <button>

                    <img
                        src="/images/button/login.png"
                        alt="3GYM"
                        width="36"
                        height="36"
                    />

                    <span className="now">Ngay luôn!</span>
                    <span className="play">Đăng nhập</span>

                </button>
            </div>
        </>
    );
};

export default Button;