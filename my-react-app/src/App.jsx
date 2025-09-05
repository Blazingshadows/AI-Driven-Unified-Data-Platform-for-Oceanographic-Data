import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Container, Row, Col, Card, Form, Badge, Spinner, Alert } from 'react-bootstrap';

// --- Custom Map Component with Marker Clustering ---
const LeafletMap = ({ dataset }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Effect to initialize the map and the cluster group once
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && window.L && window.L.markerClusterGroup) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Initialize a MarkerClusterGroup instead of a regular LayerGroup
      markersLayerRef.current = window.L.markerClusterGroup().addTo(mapInstanceRef.current);
    }
  }, []);

  // Effect to update markers when the dataset changes
  useEffect(() => {
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
      
      const markers = [];
      if (dataset && dataset.records) {
        dataset.records.forEach(record => {
           if(record.lat != null && record.lon != null) {
            const marker = window.L.circleMarker([record.lat, record.lon], {
              radius: 6,
              color: "#E63946",
              fillColor: "#F03A47",
              fillOpacity: 0.7
            });
            marker.bindPopup(`<strong>Species:</strong> ${record.species || 'N/A'}`);
            markers.push(marker);
           }
        });
        // Add all markers to the cluster group at once for better performance
        markersLayerRef.current.addLayers(markers);
      }
    }
  }, [dataset]);

  return <div ref={mapContainerRef} style={{ height: '450px', width: '100%', borderRadius: '8px' }} />;
};


const App = () => {
  const [allDatasets, setAllDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // --- Asset Loading: Load all external CSS and JS when the app starts ---
  useEffect(() => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load error for ${src}`));
      document.head.appendChild(script);
    });

    const loadCss = (href) => {
       if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };
    
    // Load Leaflet JS and the MarkerCluster plugin JS
    Promise.all([
      loadScript('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'),
      loadScript('https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js')
    ])
    .then(() => {
      // Once scripts are loaded, load all necessary CSS files
      loadCss('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css');
      loadCss('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css');
      loadCss('https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css');
      loadCss('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css');
      setAssetsLoaded(true);
    }).catch(err => {
        console.error(err);
        setError("Failed to load critical map libraries.");
        setLoading(false);
    });
  }, []);

  // --- Data Fetching: Runs only after external assets have been loaded ---
  useEffect(() => {
    if (!assetsLoaded) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [res1, res2] = await Promise.all([
          fetch('http://localhost:8080/api/datasets'),
          fetch('http://localhost:8080/api/datasets2')
        ]);
        
        if (!res1.ok || !res2.ok) {
          throw new Error(`HTTP error! Could not connect to the server.`);
        }
        
        const rawData1 = await res1.json();
        const rawData2 = await res2.json();
        const processedData = processAllRawData(rawData1, rawData2);
        
        setAllDatasets(processedData);
        setFilteredDatasets(processedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please ensure the backend server is running on port 8080 and try a hard refresh (Cmd/Ctrl + Shift + R).');
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assetsLoaded]);

  // --- Filtering Logic ---
  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = allDatasets.filter(dataset =>
      (dataset.title && dataset.title.toLowerCase().includes(lowercasedSearch)) ||
      (dataset.keywords && dataset.keywords.some(keyword => keyword.toLowerCase().includes(lowercasedSearch)))
    );
    setFilteredDatasets(filtered);
    setSelectedDataset(null);
  }, [searchTerm, allDatasets]);

  // --- Data Processing and Transformation ---
  const processAllRawData = (records1, records2) => {
    const datasets = [];

    if (records1 && records1.length > 0) {
      datasets.push({
        id: 1,
        title: 'India Biodiversity Portal (IBP) Occurrence Data',
        abstract: `A comprehensive dataset from the IBP, containing ${records1.length.toLocaleString()} individual occurrence records.`,
        keywords: ['marine', 'biodiversity', 'database', 'IBP'],
        stats: {
          occurrenceCount: records1.length,
          speciesCount: new Set(records1.map(r => r.scientificName)).size,
          timeRange: '2016-2022'
        },
        records: records1.map(r => ({ lat: r.decimalLatitude, lon: r.decimalLongitude, species: r.scientificName })),
        chartData: generateChartData(records1, 'dateIdentified'),
      });
    }

    if (records2 && records2.length > 0) {
      datasets.push({
        id: 2,
        title: 'Angria Bank Coral and Fish Data',
        abstract: `A focused dataset from the Angria Bank region with ${records2.length.toLocaleString()} records, primarily detailing coral and fish species.`,
        keywords: ['Angria Bank', 'Coral', 'Fish', 'West Coast'],
        stats: {
          occurrenceCount: records2.length,
          speciesCount: new Set(records2.map(r => r.scientificName)).size,
          timeRange: '2019'
        },
        records: records2.map(r => ({ lat: r.decimalLatitude, lon: r.decimalLongitude, species: r.scientificName })),
        chartData: generateChartData(records2, 'eventDate'),
      });
    }
  
    return datasets;
  };
  
  const generateChartData = (records, dateField) => {
    const yearCounts = {};
    records.forEach(record => {
      const dateString = (record[dateField] || '').split('/')[0];
      if (dateString) {
        const year = new Date(dateString).getFullYear();
        if (year && !isNaN(year)) {
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      }
    });
    return Object.keys(yearCounts).map(year => ({
      year: parseInt(year),
      count: yearCounts[year]
    })).sort((a,b) => a.year - b.year);
  }

  // --- UI Sub-components ---
 const DatasetCard = ({ dataset }) => (
  <Card
    onClick={() => setSelectedDataset(dataset.id === (selectedDataset && selectedDataset.id) ? null : dataset)}
    className={`mb-3 dataset-card bg-dark text-light ${selectedDataset && selectedDataset.id === dataset.id ? 'border-info shadow-lg' : 'shadow-sm'}`}
    style={{ cursor: 'pointer', borderRadius: '12px', transition: 'all 0.3s ease' }}
  >
    <Card.Body>
      <Card.Title className="text-info">{dataset.title}</Card.Title>
      <Card.Text className="text-secondary">{dataset.abstract}</Card.Text>
      <div className="my-3">
        {dataset.keywords.map(keyword => (
          <Badge
            key={keyword}
            bg="info"
            text="dark"
            className="me-2 fw-normal"
          >
            {keyword}
          </Badge>
        ))}
      </div>
      <Card.Text className="d-flex justify-content-between text-muted small">
        <span>Occurrences: <strong className="text-light">{dataset.stats.occurrenceCount.toLocaleString()}</strong></span>
        <span>Species: <strong className="text-light">{dataset.stats.speciesCount.toLocaleString()}</strong></span>
        <span>Time Range: <strong className="text-light">{dataset.stats.timeRange}</strong></span>
      </Card.Text>
    </Card.Body>
  </Card>
);

  const ExpandedView = ({ dataset }) => (
  <div className="my-5 p-4 p-md-5 bg-dark text-light shadow-lg rounded">
    <h2 className="text-center text-info mb-4">{dataset.title} Details</h2>
    <Row className="text-center mb-4">
      <Col md={4} className="mb-3">
        <Card bg="secondary" text="light" className="h-100">
          <Card.Body>
            <Card.Title className="h2 text-info">{dataset.stats.occurrenceCount.toLocaleString()}</Card.Title>
            <Card.Text className="text-light">Occurrence Records</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card bg="secondary" text="light" className="h-100">
          <Card.Body>
            <Card.Title className="h2 text-info">{dataset.stats.speciesCount.toLocaleString()}</Card.Title>
            <Card.Text className="text-light">Unique Species</Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card bg="secondary" text="light" className="h-100">
          <Card.Body>
            <Card.Title className="h2 text-info">{dataset.stats.timeRange}</Card.Title>
            <Card.Text className="text-light">Time Range</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    <div className="my-4">
      <h3 className="mb-3 text-info">Occurrence Map 🌍</h3>
      <div className="rounded overflow-hidden border border-secondary">
        <LeafletMap dataset={dataset} />
      </div>
    </div>
    <div className="my-4">
      <h3 className="mb-3 text-info">Records Per Year 📈</h3>
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataset.chartData}
            margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
          >
            <XAxis dataKey="year" stroke="#f1f1f1" />
            <YAxis allowDecimals={false} stroke="#f1f1f1" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #444', color: '#f1f1f1' }}
            />
            <Bar dataKey="count" fill="#00bcd4" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);


  // --- Conditional Rendering for Loading/Error states ---
  if (!assetsLoaded || loading) {
    return (<Container className="d-flex vh-100 justify-content-center align-items-center"><Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} /><h3 className="ms-3 text-muted">Loading Assets & Data...</h3></Container>);
  }
  if (error) {
    return (<Container className="text-center mt-5"><Alert variant="danger"><h4>Connection Error</h4><p className="mb-0">{error}</p></Alert></Container>);
  }
  
  // --- Main Application Render ---
  return (
    <Container className="my-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary">Oceanographic Data Explorer</h1>
        <p className="lead text-muted">Explore marine biodiversity datasets from the Indian Ocean region.</p>
        <Form.Control type="text" placeholder="🔍 Search by keyword..." className="mt-4 mx-auto rounded-pill shadow-sm p-3" style={{maxWidth: '600px'}} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <Row>
        {filteredDatasets.length > 0 ? (
          filteredDatasets.map(dataset => (
            <Col lg={6} md={12} key={dataset.id}><DatasetCard dataset={dataset} /></Col>
          ))
        ) : (
          <Col xs={12}><p className="text-center text-muted mt-4">No datasets found matching your search term.</p></Col>
        )}
      </Row>
      {selectedDataset && <ExpandedView dataset={selectedDataset} />}
    </Container>
  );
};

export default App;

