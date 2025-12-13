

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: "rgb(77,95,171)" }}
        >
          Disclaimer
        </h1>

        <p className="text-gray-700 mb-4">
          The information provided on our Room Renting Platform is for general
          purposes only. While we strive to keep listings accurate, we make no
          warranties regarding the completeness, reliability, or accuracy of the
          information.
        </p>

        <h2
          className="text-xl font-semibold mt-6 mb-2"
          style={{ color: "rgb(77,95,171)" }}
        >
          Platform Responsibility
        </h2>
        <p className="text-gray-700 mb-4">
          We are not a property dealer, broker, or legal authority. We only act
          as a digital platform to connect property owners with potential
          tenants. Any agreement or transaction happens directly between users.
        </p>

        <h2
          className="text-xl font-semibold mt-6 mb-2"
          style={{ color: "rgb(77,95,171)" }}
        >
          Third-Party Links
        </h2>
        <p className="text-gray-700 mb-4">
          Our website may contain links to third-party websites. We are not
          responsible for the content or practices of such external sites.
        </p>

        <h2
          className="text-xl font-semibold mt-6 mb-2"
          style={{ color: "rgb(77,95,171)" }}
        >
          User Verification
        </h2>
        <p className="text-gray-700 mb-4">
          Users are advised to personally verify property ownership, rental
          terms, and legal documentation before entering into agreements or
          making payments.
        </p>

        <h2
          className="text-xl font-semibold mt-6 mb-2"
          style={{ color: "rgb(77,95,171)" }}
        >
          Liability
        </h2>
        <p className="text-gray-700">
          We will not be liable for any losses, damages, fraud, or disputes
          arising from the use of our website or reliance on property listings.
        </p>
  </div>
    </div>
  );
}
