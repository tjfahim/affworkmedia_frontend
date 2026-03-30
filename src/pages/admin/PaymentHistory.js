// pages/admin/PaymentHistory.js
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Pagination,
    Card,
    Row,
    Col,
    Badge
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHistory,
    faEdit,
    faTrash,
    faEye,
    faSync,
    faCheckCircle,
    faTimesCircle,
    faClock,
    faBan
} from '@fortawesome/free-solid-svg-icons';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const PaymentHistory = () => {
    const { hasPermission } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        from_date: '',
        to_date: '',
        search: ''
    });
    const [statistics, setStatistics] = useState({});
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    });
    const [editForm, setEditForm] = useState({
        title: '',
        price: '',
        status: '',
        transaction_id: '',
        notes: ''
    });
    const [updatingStatus, setUpdatingStatus] = useState(null);

    useEffect(() => {
        fetchPayments();
        fetchStatistics();
    }, [filters]);

    const fetchPayments = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                per_page: pagination.per_page,
                ...filters
            };
            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });
            
            const response = await paymentService.getAllPayments(params);
            
            if (response.success) {
                setPayments(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });
            }
        } catch (error) {
            setError('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await paymentService.getAllPayments({ per_page: 1 });
            if (response.success && response.statistics) {
                setStatistics(response.statistics);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handlePageChange = (page) => {
        fetchPayments(page);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            from_date: '',
            to_date: '',
            search: ''
        });
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true);
    };

    const handleEditPayment = (payment) => {
        setSelectedPayment(payment);
        setEditForm({
            title: payment.title || '',
            price: payment.price,
            status: payment.status,
            transaction_id: payment.transaction_id || '',
            notes: payment.notes || ''
        });
        setShowEditModal(true);
    };

    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await paymentService.updatePayment(selectedPayment.id, editForm);
            if (response.success) {
                setSuccess('Payment updated successfully');
                setTimeout(() => {
                    setShowEditModal(false);
                    fetchPayments(pagination.current_page);
                    fetchStatistics();
                    setSuccess('');
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update payment');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = async (paymentId) => {
        setUpdatingStatus(paymentId);
        try {
            // Get the current payment data
            const payment = payments.find(p => p.id === paymentId);
            
            // Update status to completed
            const response = await paymentService.updatePayment(paymentId, {
                status: 'completed',
                transaction_id: payment.transaction_id,
                notes: payment.notes,
                title: payment.title,
                price: payment.price
            });
            
            if (response.success) {
                setSuccess('Payment marked as completed successfully!');
                fetchPayments(pagination.current_page);
                fetchStatistics();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update status');
            setTimeout(() => setError(''), 3000);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
            try {
                const response = await paymentService.deletePayment(paymentId);
                if (response.success) {
                    setSuccess('Payment deleted successfully');
                    fetchPayments(pagination.current_page);
                    fetchStatistics();
                    setTimeout(() => setSuccess(''), 3000);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete payment');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <Badge bg="success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Completed</Badge>;
            case 'pending':
                return <Badge bg="warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Pending</Badge>;
            case 'failed':
                return <Badge bg="danger"><FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Failed</Badge>;
            case 'cancelled':
                return <Badge bg="secondary"><FontAwesomeIcon icon={faBan} className="me-1" /> Cancelled</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-2">
                        <FontAwesomeIcon icon={faHistory} className="me-2 text-primary" />
                        Payment History
                    </h2>
                    <p className="text-muted">View and manage all affiliate payment transactions</p>
                </div>
                <Button variant="outline-primary" onClick={() => fetchPayments(1)}>
                    <FontAwesomeIcon icon={faSync} className="me-2" /> Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert variant="success" onClose={() => setSuccess('')} dismissible className="mb-4">
                    {success}
                </Alert>
            )}

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Payments</h6>
                            <h3 className="mb-0">{statistics.total_payments || 0}</h3>
                            <small className="text-muted">Total transactions</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Total Amount</h6>
                            <h3 className="mb-0 text-success">
                                ${parseFloat(statistics.total_amount || 0).toFixed(2)}
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Pending Amount</h6>
                            <h3 className="mb-0 text-warning">
                                ${parseFloat(statistics.pending_amount || 0).toFixed(2)}
                            </h3>
                            <small>{statistics.pending_count || 0} pending payments</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h6 className="text-muted">Completed Amount</h6>
                            <h3 className="mb-0 text-info">
                                ${parseFloat(statistics.completed_amount || 0).toFixed(2)}
                            </h3>
                            <small>{statistics.completed_count || 0} completed payments</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="from_date"
                                    value={filters.from_date}
                                    onChange={handleFilterChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="to_date"
                                    value={filters.to_date}
                                    onChange={handleFilterChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Search</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="search"
                                    placeholder="Email, title, transaction ID..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className="text-end">
                            <Button variant="secondary" onClick={clearFilters} className="me-2">
                                <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Payments Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive striped hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Affiliate</th>
                                <th>Title</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && payments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2">Loading payments...</p>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5">
                                        <h5>No payments found</h5>
                                        <p className="text-muted">Try adjusting your filters</p>
                                    </td>
                                </tr>
                            ) : (
                                payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td>
                                            <div className="fw-bold">{payment.affiliate?.first_name} {payment.affiliate?.last_name}</div>
                                            <small className="text-muted">{payment.email}</small>
                                        </td>
                                        <td>{payment.title || 'N/A'}</td>
                                        <td>
                                            <span className="fw-bold text-success">
                                                ${parseFloat(payment.price).toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <Badge bg="info">
                                                {payment.pay_method?.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td>
                                            {getStatusBadge(payment.status)}
                                            {updatingStatus === payment.id && (
                                                <Spinner animation="border" size="sm" className="ms-2" />
                                            )}
                                        </td>
                                        <td>
                                            <small>{new Date(payment.created_at).toLocaleDateString()}</small>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => handleViewPayment(payment)}
                                                    title="View Details"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>
                                                
                                                {hasPermission('edit payments') && (
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={() => handleEditPayment(payment)}
                                                        title="Edit Payment"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                )}
                                                
                                                {hasPermission('edit payments') && payment.status === 'pending' && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleMarkAsCompleted(payment.id)}
                                                        title="Mark as Completed"
                                                        disabled={updatingStatus === payment.id}
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                    </Button>
                                                )}
                                                
                                                {hasPermission('delete payments') && payment.status !== 'completed' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeletePayment(payment.id)}
                                                        title="Delete Payment"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                )}
                                                
                                               
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.Prev 
                                    disabled={pagination.current_page === 1}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                />
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={pagination.current_page === i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                />
                            </Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* View Payment Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faEye} className="me-2 text-info" />
                        Payment Details #{selectedPayment?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <>
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="text-muted">Payment Information</h6>
                                            <hr />
                                            <p><strong>Title:</strong> {selectedPayment.title || 'N/A'}</p>
                                            <p><strong>Amount:</strong> <span className="text-success fw-bold">${parseFloat(selectedPayment.price).toFixed(2)}</span></p>
                                            <p><strong>Payment Method:</strong> {selectedPayment.pay_method?.toUpperCase()}</p>
                                            <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
                                            {selectedPayment.transaction_id && (
                                                <p><strong>Transaction ID:</strong> {selectedPayment.transaction_id}</p>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border-0 bg-light">
                                        <Card.Body>
                                            <h6 className="text-muted">Affiliate Information</h6>
                                            <hr />
                                            <p><strong>Name:</strong> {selectedPayment.affiliate?.first_name} {selectedPayment.affiliate?.last_name}</p>
                                            <p><strong>Email:</strong> {selectedPayment.email}</p>
                                            <p><strong>Company:</strong> {selectedPayment.affiliate?.company || 'N/A'}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            {selectedPayment.description && (
                                <Card className="border-0 bg-light mb-3">
                                    <Card.Body>
                                        <h6 className="text-muted">Description</h6>
                                        <p>{selectedPayment.description}</p>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            {selectedPayment.notes && (
                                <Card className="border-0 bg-light">
                                    <Card.Body>
                                        <h6 className="text-muted">Notes</h6>
                                        <p className="text-muted">{selectedPayment.notes}</p>
                                    </Card.Body>
                                </Card>
                            )}
                            
                            <div className="text-muted mt-3">
                                <small>Created: {new Date(selectedPayment.created_at).toLocaleString()}</small>
                                {selectedPayment.paid_at && (
                                    <>
                                        <br />
                                        <small>Paid: {new Date(selectedPayment.paid_at).toLocaleString()}</small>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        Close
                    </Button>
                    {hasPermission('edit payments') && (
                        <>
                            <Button 
                                variant="primary" 
                                onClick={() => {
                                    setShowViewModal(false);
                                    handleEditPayment(selectedPayment);
                                }}
                            >
                                <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit Payment
                            </Button>
                            {selectedPayment?.status === 'pending' && (
                                <Button 
                                    variant="success" 
                                    onClick={() => {
                                        handleMarkAsCompleted(selectedPayment.id);
                                        setShowViewModal(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Mark as Completed
                                </Button>
                            )}
                        </>
                    )}
              
                </Modal.Footer>
            </Modal>

            {/* Edit Payment Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faEdit} className="me-2 text-warning" />
                        Edit Payment #{selectedPayment?.id}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdatePayment}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                        required
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Transaction ID</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={editForm.transaction_id}
                                        onChange={(e) => setEditForm({...editForm, transaction_id: e.target.value})}
                                        placeholder="Enter transaction ID"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editForm.notes}
                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                placeholder="Add notes about this payment..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Payment'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default PaymentHistory;