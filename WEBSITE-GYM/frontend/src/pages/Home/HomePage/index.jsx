import React from "react";
import Banner from "./Banner";

export default function HomePage() {
  return (      
    <div>
      <Banner />
    </div>
  );
}

// Test API CÓ KẾT NỐI?
// import { useEffect } from "react";
// import api from "../../../API/api";

// const HomePage = () => {

//   useEffect(() => {
//     api.get("TestController.php")
//       .then((res) => {
//         console.log(res.data);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   return <div>Home Page</div>;
// };

// export default HomePage;