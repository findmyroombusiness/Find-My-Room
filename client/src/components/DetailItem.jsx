import React from "react";

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
    <div className="text-[rgb(77,95,171)]">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

export default DetailItem;
