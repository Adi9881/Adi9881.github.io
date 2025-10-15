
// Shared React + AJAX renderer for skillset / projects / works / home
const { useState, useEffect } = React;

// Card comp. which matches my CSS classes: card, card-icon, card-text
function SectionCard({ section, idx, isOpen, onToggle }) {
 
  const headingStyle = {
    borderBottom: "2px solid rgba(0,0,0,0.0)", // will rely on CSS but keep subtle inline fallback
    paddingBottom: "6px",
    color: undefined // let CSS control colour per page
  };

  // Build left image/icon if present
  const leftImage = (() => {
    if (section.img) {
      return React.createElement(
        "div",
        { className: "card-icon", style: { display: "inline-block", verticalAlign: "top", marginRight: "16px" } },
        React.createElement("img", { src: section.img, alt: section.heading + " image" })
      );
    }
    return null;
  })();

  const contentNode = (() => {
   
    if (section.items && Array.isArray(section.items)) {
      const lis = section.items.map((it, i) =>
        React.createElement(
          "li",
          { key: i, style: { display: "flex", alignItems: "center", margin: "10px 0" } },
          React.createElement("img", {
            src: it.img,
            alt: it.label,
            style: { width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", objectFit: "cover", background: "white", padding: "5px" }
          }),
          React.createElement("span", { style: { fontSize: "1.05rem" } }, it.label)
        )
      );
      return React.createElement("ul", { className: "list-with-icons", style: { marginTop: "10px" } }, lis);
    }

    // Projects / works: paragraphs
    if (section.paragraphs && Array.isArray(section.paragraphs)) {
      return section.paragraphs.map((p, i) =>
        React.createElement("p", { key: i, style: { marginBottom: "10px" } }, p)
      );
    }

    // fallback text
    if (section.content) {
      if (Array.isArray(section.content)) {
        return section.content.map((p, i) => React.createElement("p", { key: i }, p));
      }
      return React.createElement("p", null, section.content);
    }

    return React.createElement("p", null, "No content.");
  })();

  // Card inner structure: preserve .card, .card-icon, .card-text classes so your CSS applies
  return React.createElement(
    "div",
    { className: "card", style: { marginBottom: "18px" } },
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "flex-start" } },
      leftImage,
      React.createElement(
        "div",
        { className: "card-text", style: { flex: 1 } },
        React.createElement(
          "h2",
          {
            onClick: () => onToggle(idx),
            style: { cursor: "pointer", userSelect: "none" }
          },
          section.heading
        ),
        isOpen ? React.createElement("div", null, contentNode) : null
      )
    )
  );
}

function App() {
  const [sections, setSections] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // html files -> json files mapping
    const fileMap = {
      "skillset.html": "data-skillset.json",
      "projects.html": "data-projects.json",
      "works.html": "data-works.json"
    };

    // determine which page I'm on
    const href = window.location.href;
    const pageKey = Object.keys(fileMap).find((fn) => href.includes(fn));

    if (!pageKey) {
      // home page: small simple card 
      setSections([
        {
          heading: "Welcome to My Portfolio",
          paragraphs: ["Explore my skills, projects, and works using the navigation above!"]
        }
      ]);
      return;
    }

    const dataFile = fileMap[pageKey];

    fetch(dataFile)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((json) => {
        // JSON expected to have { sections: [ { heading, items|img|paragraphs } ] }
        setSections(json.sections || []);
      })
      .catch((err) => {
        console.error("Error loading page data:", err);
        // fallback message
        setSections([{ heading: "Error", paragraphs: ["Could not load content. Check data file."] }]);
      });
  }, []);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
    // Optional: scroll into view for opened section
    // (left out to keep behavior minimal)
  };

  return React.createElement(
    "div",
    null,
    sections.map((s, i) =>
      React.createElement(SectionCard, {
        key: i,
        section: s,
        idx: i,
        isOpen: openIndex === i,
        onToggle: toggle
      })
    )
  );
}

// Mount app to #react-content if present
document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("react-content");
  if (mount) {
    const root = ReactDOM.createRoot(mount);
    root.render(React.createElement(App));
  }
});

