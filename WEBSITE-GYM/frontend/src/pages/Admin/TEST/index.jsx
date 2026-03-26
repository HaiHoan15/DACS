import { useState } from "react";

const SCALE = 20; //1m = 20px

export default function RoomEditor() {
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(50);
    const [area, setArea] = useState(1000);
    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);
    const roomWidth = height * SCALE;
    const roomHeight = width * SCALE;
    const [items, setItems] = useState([
        {
            id: 1,
            x: 0,
            y: 0,
            width: 2 * SCALE,   // 2m
            height: 1 * SCALE   // 1m
        }
    ]);

    // Khi đổi width
    const handleWidthChange = (value) => {
        const newWidth = Number(value);
        setWidth(newWidth);
        setArea(newWidth * height);
    };

    // Khi đổi height
    const handleHeightChange = (value) => {
        const newHeight = Number(value);
        setHeight(newHeight);
        setArea(width * newHeight);
    };

    // Khi đổi diện tích
    const handleAreaChange = (value) => {
        if (value === "") {
            setArea("");
            return;
        }

        const newArea = Number(value);
        if (newArea <= 0) return;

        const currentArea = width * height;

        //  Nếu đang = 0 thì set lại mặc định (hình vuông)
        if (currentArea === 0) {
            const size = Math.sqrt(newArea);
            setWidth(Number(size.toFixed(2)));
            setHeight(Number(size.toFixed(2)));
            setArea(newArea);
            return;
        }

        // Bình thường thì scale
        const scale = Math.sqrt(newArea / currentArea);

        const newWidth = width * scale;
        const newHeight = height * scale;

        setWidth(Number(newWidth.toFixed(2)));
        setHeight(Number(newHeight.toFixed(2)));
        setArea(newArea);
    };
    // Hàm để căn chỉnh theo lưới
    const snapToGrid = (value) => {
        return Math.round(value / SCALE) * SCALE;
    };
    console.log(snapToGrid(37)); // ~40

    return (
        <div style={{ padding: "20px" }}>
            <h2>Quản lý phòng Gym</h2>

            {/* Input */}
            <div style={{ marginBottom: "20px" }}>
                <label>Chiều rộng (m): </label>
                <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                />

                <label style={{ marginLeft: "10px" }}>Chiều dài (m): </label>
                <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                />

                <label style={{ marginLeft: "10px" }}>Diện tích (m²): </label>
                <input
                    type="number"
                    value={area}
                    min="1"
                    onChange={(e) => handleAreaChange(e.target.value)}
                />
            </div>

            {/* Room */}
            <div
                style={{
                    width: height * SCALE,
                    height: width * SCALE,
                    border: "3px solid black",
                    position: "relative",

                    backgroundImage: `
            linear-gradient(to right, #ccc 1px, transparent 1px),
            linear-gradient(to bottom, #ccc 1px, transparent 1px)
        `,
                    backgroundSize: `${SCALE}px ${SCALE}px`
                }}

                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();

                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    //  DRAG
                    if (draggingId !== null) {
                        setItems((prev) =>
                            prev.map((item) =>
                                item.id === draggingId
                                    ? {
                                        ...item,
                                        x: Math.max(
                                            0,
                                            Math.min(
                                                roomWidth - item.width,
                                                snapToGrid(x - item.width / 2)
                                            )
                                        ),
                                        y: Math.max(
                                            0,
                                            Math.min(
                                                roomHeight - item.height,
                                                snapToGrid(y - item.height / 2)
                                            )
                                        )
                                    }
                                    : item
                            )
                        );
                    }

                    //  RESIZE
                    if (resizingId !== null) {
                        setItems((prev) =>
                            prev.map((item) =>
                                item.id === resizingId
                                    ? {
                                        ...item,
                                        width: Math.max(
                                            SCALE,
                                            Math.min(
                                                roomWidth - item.x,
                                                snapToGrid(x - item.x)
                                            )
                                        ),
                                        height: Math.max(
                                            SCALE,
                                            Math.min(
                                                roomHeight - item.y,
                                                snapToGrid(y - item.y)
                                            )
                                        )
                                    }
                                    : item
                            )
                        );
                    }
                }}

                onMouseUp={() => {
                    setDraggingId(null);
                    setResizingId(null);
                }}
                onMouseLeave={() => setDraggingId(null)}
            >
                {/* ITEMS */}
                {items.map((item) => (
                    <div
                        key={item.id}
                        onMouseDown={() => setDraggingId(item.id)}
                        style={{
                            position: "absolute",
                            left: item.x,
                            top: item.y,
                            width: item.width,
                            height: item.height,
                            background: "orange",
                            cursor: "grab",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            userSelect: "none"
                        }}
                    >
                        Máy tập

                        {/* NÚT RESIZE */}
                        <div
                            onMouseDown={(e) => {
                                e.stopPropagation(); //  cực quan trọng
                                setResizingId(item.id);
                            }}
                            style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: "10px",
                                height: "10px",
                                background: "black",
                                cursor: "nwse-resize"
                            }}
                        />
                    </div>
                ))}
            </div>
            {/* Button thêm máy tập */}
            <button
                onClick={() => {
                    setItems(prev => [
                        ...prev,
                        {
                            id: Date.now(),
                            x: 0,
                            y: 0,
                            width: 2 * SCALE,
                            height: 1 * SCALE
                        }
                    ]);
                }}
            >
                Thêm máy tập
            </button>
        </div>

    );
}