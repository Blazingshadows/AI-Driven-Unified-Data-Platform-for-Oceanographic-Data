import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Container, Row, Col, Card, Form, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Data Mocking (Replace with real API calls)
const MOCK_DATASETS = [
{
id: 1,
title: 'IndOBIS India Biodiversity Portal (IBP) Species Occurrence Data',
abstract: 'This dataset aggregates species occurrence records from the India Biodiversity Portal (IBP) and serves them through the IndOBIS network. It contains georeferenced records of various marine and terrestrial species found in and around the Indian subcontinent.',
keywords: ['marine', 'biodiversity', 'fish', 'India'],
stats: {
occurrenceCount: 10039,
speciesCount: 2501,
timeRange: '1900-2023'
},
records: [
{ lat: 10.82, lon: 76.53, species: 'Labeo rohita' },
{ lat: 12.97, lon: 77.59, species: 'Oryza sativa' },
{ lat: 21.15, lon: 79.08, species: 'Channa punctata' },
{ lat: 8.76, lon: 77.34, species: 'Macrobrachium rosenbergii' },
{ lat: 15.30, lon: 74.08, species: 'Penaeus monodon' },
{ lat: 13.08, lon: 80.27, species: 'Sardinella longiceps' },
{ lat: 11.25, lon: 75.78, species: 'Rastrelliger kanagurta' },
{ lat: 17.68, lon: 83.22, species: 'Carcharhinus leucas' },
{ lat: 18.52, lon: 73.85, species: 'Etroplus suratensis' },
{ lat: 13.0, lon: 80.2, species: 'Puntius sophore' },
],
chartData: [
{ year: 2018, count: 500 },
{ year: 2019, count: 850 },
{ year: 2020, count: 1200 },
{ year: 2021, count: 2500 },
{ year: 2022, count: 3500 },
{ year: 2023, count: 1500 },
],
},
{
id: 2,
title: 'Marine Microbe Data from West Coast of India',
abstract: 'A collection of occurrence data for marine microbes sampled along the Arabian Sea coastline of India.',
keywords: ['microbe', 'marine', 'Arabian Sea'],
stats: { occurrenceCount: 520, speciesCount: 112, timeRange: '2015-2020' },
records: [
{ lat: 17.58, lon: 71.95, species: 'Vibrio cholerae' },
{ lat: 18.96, lon: 72.82, species: 'Escherichia coli' },
],
chartData: [
{ year: 2015, count: 50 },
{ year: 2016, count: 100 },
{ year: 2017, count: 120 },
{ year: 2018, count: 150 },
{ year: 2019, count: 80 },
],
},
];

const App = () => {
const [datasets, setDatasets] = useState(MOCK_DATASETS);
const [searchTerm, setSearchTerm] = useState('');
const [selectedDataset, setSelectedDataset] = useState(null);

useEffect(() => {
const filtered = MOCK_DATASETS.filter(dataset =>
dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
dataset.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
dataset.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
);
setDatasets(filtered);
setSelectedDataset(null);
}, [searchTerm]);

const DatasetCard = ({ dataset }) => (
<Card
onClick={() => setSelectedDataset(dataset)}
className={`mb-3 dataset-card ${selectedDataset && selectedDataset.id === dataset.id ? 'border-primary shadow' : ''}`}
style={{ cursor: 'pointer', transition: 'transform .2s ease-in-out' }}
>
<Card.Body>
<Card.Title className="text-primary">{dataset.title}</Card.Title>
<Card.Text className="text-muted text-truncate-2">{dataset.abstract}</Card.Text>
<div className="my-3">
{dataset.keywords.map(keyword => (
<Badge key={keyword} bg="secondary" className="me-2">{keyword}</Badge>
))}
</div>
<Card.Text className="d-flex justify-content-between text-muted">
<span>Occurrences: {dataset.stats.occurrenceCount}</span>
<span>Species: {dataset.stats.speciesCount}</span>
<span>Time Range: {dataset.stats.timeRange}</span>
</Card.Text>
</Card.Body>
</Card>
);

const ExpandedView = ({ dataset }) => (
<div className="my-5 p-5 bg-white shadow rounded">
<h2 className="text-center text-primary mb-4">{dataset.title} Details</h2>
{/* Stats Cards */}
<Row className="text-center mb-4">
<Col md={4} className="mb-3">
<Card bg="light">
<Card.Body>
<Card.Title className="h2 text-primary">{dataset.stats.occurrenceCount.toLocaleString()}</Card.Title>
<Card.Text className="text-muted">Occurrence Records</Card.Text>
</Card.Body>
</Card>
</Col>
<Col md={4} className="mb-3">
<Card bg="light">
<Card.Body>
<Card.Title className="h2 text-primary">{dataset.stats.speciesCount.toLocaleString()}</Card.Title>
<Card.Text className="text-muted">Species Count</Card.Text>
</Card.Body>
</Card>
</Col>
<Col md={4} className="mb-3">
<Card bg="light">
<Card.Body>
<Card.Title className="h2 text-primary">{dataset.stats.timeRange}</Card.Title>
<Card.Text className="text-muted">Time Range</Card.Text>
</Card.Body>
</Card>
</Col>
</Row>

{/* World Map */}
<div className="my-4">
<h3 className="mb-3 text-primary">Occurrence Map 🌍</h3>
<div className="rounded overflow-hidden border">
<MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '400px', width: '100%' }}>
<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/>
{dataset.records.map((record, index) => (
<CircleMarker key={index} center={[record.lat, record.lon]} radius={5} color="red" fillColor="red" fillOpacity={0.7} />
))}
</MapContainer>
</div>
</div>

{/* Bar Chart */}
<div className="my-4">
<h3 className="mb-3 text-primary">Records Per Year 📈</h3>
<div style={{ height: '300px' }}>
<ResponsiveContainer width="100%" height="100%">
<BarChart data={dataset.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
<XAxis dataKey="year" />
<YAxis />
<Tooltip />
<Bar dataKey="count" fill="#0d6efd" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
</div>
);

return (
<Container className="my-5">
<div className="text-center mb-5">
<h1 className="display-4 fw-bold text-primary">IndOBIS Explorer</h1>
<p className="text-muted">Explore marine biodiversity datasets from India.</p>
<Form.Control
type="text"
placeholder="🔍 Search datasets by keyword or title..."
className="mt-4 rounded-pill shadow-sm"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
/>
</div>

<Row>
{datasets.length > 0 ? (
datasets.map(dataset => (
<Col lg={4} md={6} key={dataset.id}>
<DatasetCard dataset={dataset} />
</Col>
))
) : (
<Col xs={12}>
<p className="text-center text-muted">No datasets found matching your search.</p>
</Col>
)}
</Row>
{selectedDataset && <ExpandedView dataset={selectedDataset} />}
</Container>
);
};

export default App;