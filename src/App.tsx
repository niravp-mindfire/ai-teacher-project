// App.tsx
import React, { Suspense } from "react";
import "./App.css";
import Classroom from "./components/Classroom";

const App = () => {
  return (
    <div className="App">
      <h1>AI Teacher Classroom</h1>
      {/* Suspense with a fallback loader */}
      <Suspense fallback={<div>Loading classroom...</div>}>
        <Classroom />
      </Suspense>
    </div>
  );
};

export default App;
