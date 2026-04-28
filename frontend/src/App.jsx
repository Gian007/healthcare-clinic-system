import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://backend.test/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Connection failed");
      });
  }, []);

  return (
    <div>
      <h1>Appointments</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;