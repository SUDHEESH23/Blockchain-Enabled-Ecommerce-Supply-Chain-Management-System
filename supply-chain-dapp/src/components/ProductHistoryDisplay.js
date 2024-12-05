import React, { useState } from "react";

const ProductHistoryAccordion = ({ history }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {history.map((event, index) => (
        <div key={index} className="border rounded shadow-sm">
          <button
            className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200"
            onClick={() => toggleAccordion(index)}
          >
            <strong>Event {index + 1}: </strong> 
            {event.eventDescription.length > 50
              ? `${event.eventDescription.substring(0, 50)}...`
              : event.eventDescription}
          </button>
          {activeIndex === index && (
            <div className="p-4 bg-white">
              <div className="text-sm text-gray-500">Date: {event.formattedDate}</div>
              <div className="text-sm text-gray-700 mt-2">{event.eventDescription}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductHistoryAccordion;
