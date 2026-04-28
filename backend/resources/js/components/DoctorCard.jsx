import { FaCalendarAlt } from "react-icons/fa";

const animalImages = [
      "https://imgs.search.brave.com/QC6UOdl5o1VeAYcz_kDz24Amd9v27ADnkf3A0C4Yz8c/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzE1Lzg4LzY5LzU1/LzM2MF9GXzE1ODg2/OTU1NzlfT2hzSEdt/V2pJNnVldDAwR0Q1/c1YzQlBYZUNmcUpL/SUsuanBn",
        "https://imgs.search.brave.com/yOaWjrLh7mjh1sk7avMRG1s39oz31tuL1ZWGJcKMkWk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU3/NTEyMzQ5L3Bob3Rv/L2dvbGRlbi1yZXRy/aWV2ZXItZG9jdG9y/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1TY2VWRWdrVGd1/WEpTV1o0czE2NXlZ/OEN5X3ppbl92MVJi/YWJrT0M4SllvPQ",

        "https://imgs.search.brave.com/itoAkDG0r1tazaBs7gZxDED_wNFdrA2AyHov_TQQyaI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTA4/NjIxNDEwL3Bob3Rv/L2JsYWNrLWRvZy1k/cmVzc2VkLWFzLWEt/ZG9jdG9yLXNpdHRp/bmctYmVoaW5kLXRo/ZS10YWJsZS5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9bEk4/UC1wUXhILUYxX1dT/VWVlMVZrb2ZETkJU/V0trTUhNX3k3ajlL/aFRzRT0",

        "https://imgs.search.brave.com/2029aGIHMams3mLQXbIU9Yz7IdIKYAPQAJ_p_lMGVuI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cHVyaW5hLmNvLnVr/L3NpdGVzL2RlZmF1/bHQvZmlsZXMvc3R5/bGVzL3R0dF9pbWFn/ZV81MTAvcHVibGlj/LzIwMjMtMDQvSG93/JTIwdG8lMjB0ZWFj/aCUyMGElMjBkb2cl/MjB0byUyMHBsYXkl/MjBkZWFkJTIwMi5q/cGc_aXRvaz1TanZB/VERNdQ",
,
];

export default function DoctorCard({ doctor, index }) {
  const available = doctor.status === "Available";
  const image = doctor.image || animalImages[index % animalImages.length];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative h-44 bg-gray-100">
        <img
          src={image}
          alt={`Dr. ${doctor.first_name}`}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900">
          Dr. {doctor.first_name} {doctor.last_name}
        </h3>
        <p className="text-sm text-primary mt-1">
          {doctor.specialization?.specialization_name}
        </p>

        {available ? (
          <button className="mt-4 w-full bg-primary text-white py-2 rounded-md text-sm inline-flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-sm" />
            View Availability
          </button>
        ) : (
          <div className="mt-4 w-full bg-gray-100 text-gray-400 py-2 rounded-md text-sm text-center">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  );
}