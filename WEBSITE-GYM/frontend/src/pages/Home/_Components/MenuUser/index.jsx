import React from "react";

const Radio = () => {
    return (
        <> <style>{`
            .input {
            display: flex;
            flex-direction: column;
            width: 200px;
            background-color: #0d1117;
            justify-content: center;
            border-radius: 10px;
            transition: 1s;
            padding: 10px;
            overflow: hidden;
            }
            .value {
                font - size: 15px;
            background-color: transparent;
            border: none;
            padding: 10px;
            color: white;
            display: flex;
            position: relative;
            gap: 5px;
            cursor: pointer;
            border-radius: 10px;
            transition: 1s;
            box-sizing: border-box;
    }

            .value:not(:active):hover,
            .value:focus {
                display: flex;
            box-sizing: border-box;
            border: 2px solid #1a1f24;
            color: #637185;
    }

            .value:focus,
            .value:active {
                background - color: #1a1f24;
            outline: none;
            margin-left: 17px;
    }

            .value::before {
                content: "";
            position: absolute;
            top: 5px;
            left: -15px;
            width: 5px;
            height: 80%;
            background-color: #2f81f7;
            border-radius: 5px;
            opacity: 0;
            transition: 1s;
    }

            .value:focus::before,
            .value:active::before {
                opacity: 1;
    }

            .value svg {
                width: 20px;
    }

    .input:hover > :not(.value:hover) {
                transition: 300ms;
            filter: blur(1.5px);
            transform: scale(0.95, 0.95);
    }
  `}</style>

            <div className="input">
                <button className="value">
                    <svg viewBox="0 0 16 16">
                        <path d="m1.5 13v1a.5.5 0 0 0 .3379.4731 18.9718 18.9718 0 0 0 6.1621 1.0269 18.9629 18.9629 0 0 0 6.1621-1.0269.5.5 0 0 0 .3379-.4731v-1a6.5083 6.5083 0 0 0 -4.461-6.1676 3.5 3.5 0 1 0 -4.078 0 6.5083 6.5083 0 0 0 -4.461 6.1676z" fill="#7D8590" />
                    </svg>
                    Public profile
                </button>

                <button className="value">
                    <svg viewBox="0 0 32 32">
                        <path d="m16 23c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7z" fill="#7D8590" />
                    </svg>
                    Account
                </button>

                <button className="value">
                    <svg viewBox="0 0 128 128">
                        <path d="m109.9 20.63-57.463 51.843-9.348-9.348z" fill="#7D8590" />
                    </svg>
                    Appearance
                </button>

                <button className="value">
                    <svg viewBox="0 0 32 32">
                        <path d="m16 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" fill="#7D8590" />
                    </svg>
                    Accessibility
                </button>

                <button className="value">
                    <svg viewBox="0 0 24 25">
                        <path d="m12 4c-3 0-6 3-6 6v3l-2 3h16l-2-3v-3c0-3-3-6-6-6z" fill="#7D8590" />
                    </svg>
                    Notifications
                </button>
            </div>
        </>
);
};

export default Radio;
