// pages/admin/MakePayment.js
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
    faMoneyBillWave,
    faSearch,
    faSync,
    faCreditCard,
  
    faMoneyBill,
    faLandmark,
    faFilter
} from '@fortawesome/free-solid-svg-icons';
// Import brand icons from the brands package
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const MakePayment = () => {
    const { hasPermission } = useAuth();
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState(null);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        pay_method: 'paypal',
        title: '',
        description: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [minBalance, setMinBalance] = useState(10); // Default minimum balance filter
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    });
    const getPaymentEmail = () => {
    if (!selectedAffiliate) return 'No email available';

    switch (paymentForm.pay_method) {
        case 'paypal':
            return selectedAffiliate.paypal?.trim() || 'No PayPal email found';
        case 'payoneer':
            return selectedAffiliate.payoneer?.trim() || 'No Payoneer email found';
        case 'bank_transfer':
            return selectedAffiliate.account_email?.trim() || 'No bank email found';
        default:
            return 'No email available';
    }
};
    useEffect(() => {
        fetchAffiliates();
    }, [minBalance]); // Refetch when minBalance changes

    const fetchAffiliates = async (page = 1) => {
        try {
            setLoading(true);
            const response = await paymentService.getAffiliatesWithBalance({
                page,
                per_page: pagination.per_page,
                has_balance: true,
                search: searchTerm || undefined,
                min_balance: minBalance // Add minimum balance filter
            });
            
            if (response.success) {
                setAffiliates(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });
            }
        } catch (error) {
            setError('Failed to fetch affiliates');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchAffiliates(page);
    };

    const handleSearch = () => {
        fetchAffiliates(1);
    };

    const handleMinBalanceChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setMinBalance(value);
    };

    

    const openPaymentModal = (affiliate) => {
    setSelectedAffiliate(affiliate);

    const fullBalance = parseFloat(affiliate.balance || 0).toFixed(2);

    setPaymentForm({
        amount: fullBalance, // default to full balance
        pay_method: affiliate.pay_method || 'paypal',
        title: 'Commission Withdrawal',
        description: `Withdrawal request for ${affiliate.name}`,
        notes: ''
    });

    setShowPaymentModal(true);
};

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const paymentData = {
                aff_user_id: selectedAffiliate.id,
                pay_method: paymentForm.pay_method,
                title: paymentForm.title,
                description: paymentForm.description,
                notes: paymentForm.notes
            };

            // Add amount only if it's not empty (partial payment)
            if (paymentForm.amount && parseFloat(paymentForm.amount) > 0) {
                paymentData.amount = parseFloat(paymentForm.amount);
            }

            const response = await paymentService.createPayment(paymentData);
            
            if (response.success) {
                setSuccess(`Payment of $${response.data.payment_amount} processed successfully! Remaining balance: $${response.data.current_balance}`);
                setTimeout(() => {
                    setShowPaymentModal(false);
                    fetchAffiliates(pagination.current_page);
                    setSuccess('');
                }, 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'paypal':
                return faPaypal;
            case 'payoneer':
                return faCreditCard;
            case 'bank_transfer':
                return faLandmark;
            default:
                return faMoneyBill;
        }
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-primary" />
                        Make Payment to Affiliates
                    </h2>
                    <p className="text-muted">Process payments to affiliates from their commission balance</p>
                </div>
                <Button variant="outline-primary" onClick={() => fetchAffiliates(1)}>
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

            {/* Search and Filter Bar */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={5}>
                            <Form.Group>
                                <Form.Label>
                                    <FontAwesomeIcon icon={faSearch} className="me-1" />
                                    Search Affiliate
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>
                                    <FontAwesomeIcon icon={faFilter} className="me-1" />
                                    Minimum Balance Filter
                                </Form.Label>
                                <div className="d-flex">
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        step="10"
                                        value={minBalance}
                                        onChange={handleMinBalanceChange}
                                    />
                                    <Button 
                                        variant="outline-secondary" 
                                        className="ms-2"
                                        onClick={() => setMinBalance(10)}
                                        title="Reset to default (10)"
                                    >
                                        Reset
                                    </Button>
                                </div>
                                <Form.Text className="text-muted">
                                    Show affiliates with balance ≥ ${minBalance}
                                </Form.Text>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>&nbsp;</Form.Label>
                                <Button 
                                    variant="primary" 
                                    onClick={handleSearch} 
                                    className="w-100"
                                >
                                    <FontAwesomeIcon icon={faSearch} className="me-2" /> 
                                    Apply Filters
                                </Button>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Active filters info */}
                    {minBalance > 0 && (
                        <div className="mt-2">
                            <small className="text-muted">
                                <Badge bg="info" className="me-1">
                                    Filter: Balance ≥ ${minBalance}
                                </Badge>
                                {searchTerm && (
                                    <Badge bg="secondary" className="me-1">
                                        Search: {searchTerm}
                                    </Badge>
                                )}
                                <span className="ms-2">
                                    Showing {affiliates.length} of {pagination.total} affiliates
                                </span>
                            </small>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Affiliates Table */}
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Affiliates with Balance ≥ ${minBalance}
                        </h5>
                        <small className="text-muted">
                            Total: {pagination.total} affiliates
                        </small>
                    </div>
                    
                    <Table responsive striped hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Affiliate Name</th>
                                <th>Email</th>
                                <th>Balance</th>
                                <th>Payment Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && affiliates.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2">Loading affiliates...</p>
                                    </td>
                                </tr>
                            ) : affiliates.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <h5>No affiliates found with balance ≥ ${minBalance}</h5>
                                        <p className="text-muted">
                                            Try lowering the minimum balance filter or check back later
                                        </p>
                                        <Button 
                                            variant="link" 
                                            onClick={() => setMinBalance(0)}
                                            className="mt-2"
                                        >
                                            Show all affiliates
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                affiliates.map(affiliate => (
                                    <tr key={affiliate.id}>
                                        <td>{affiliate.id}</td>
                                        <td>
                                            <div className="fw-bold">{affiliate.name}</div>
                                            <small className="text-muted">{affiliate.company || 'No company'}</small>
                                        </td>
                                        <td>{affiliate.email}</td>
                                        <td>
                                            <span className={`fw-bold ${affiliate.balance >= 1000 ? 'text-success' : affiliate.balance >= 500 ? 'text-info' : 'text-warning'}`}>
                                                ${parseFloat(affiliate.balance).toFixed(2)}
                                            </span>
                                            {affiliate.balance >= 1000 && (
                                                <Badge bg="success" className="ms-2">High</Badge>
                                            )}
                                            {affiliate.balance >= 500 && affiliate.balance < 1000 && (
                                                <Badge bg="info" className="ms-2">Medium</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Badge bg="info" className="px-3 py-2">
                                                <FontAwesomeIcon 
                                                    icon={getPaymentMethodIcon(affiliate.pay_method)} 
                                                    className="me-1" 
                                                />
                                                {affiliate.pay_method?.toUpperCase() || 'NOT SET'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => openPaymentModal(affiliate)}
                                                disabled={affiliate.balance <= 0}
                                            >
                                                <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" />
                                                Make Payment
                                            </Button>
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

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-success" />
                        Make Payment to {selectedAffiliate?.name}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handlePaymentSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Available Balance</Form.Label>
                                    <h4 className="text-success">
                                        ${parseFloat(selectedAffiliate?.balance || 0).toFixed(2)}
                                    </h4>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Amount</Form.Label>
                                    <Form.Control
    type="number"
    step="0.01"
    placeholder="Leave empty for full balance"
    value={paymentForm.amount}
    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
/>
<Form.Text className="text-muted">
    Leave empty to withdraw full balance
</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        value={paymentForm.pay_method}
                                        onChange={(e) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                pay_method: e.target.value
                                            })
                                        }
                                        required
                                    >
                                        <option value="paypal">PayPal</option>
                                        <option value="payoneer">Payoneer</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </Form.Select>

                                    <div className="mt-2 p-2 rounded bg-light border">
                                        <small className="text-muted d-block">Payment will be sent to:</small>
                                        <strong className="text-primary">
                                            {getPaymentEmail()}
                                        </strong>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Title</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={paymentForm.title}
                                        onChange={(e) => setPaymentForm({...paymentForm, title: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={paymentForm.description}
                                onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes (Internal)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                placeholder="Add internal notes about this payment..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default MakePayment;