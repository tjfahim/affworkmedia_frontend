import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    Spinner,
    Alert,
    Badge,
    Button,
    Pagination,
    Form,
    Row,
    Col,
    Modal
} from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMoneyBillWave,
    faEye,
    faSync,
    faFilter,
    faCalendarAlt,
    faStickyNote,
    faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import paymentService from '../../services/paymentService';

const AffiliatePaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const response = await paymentService.getMyPayments({
                page,
                status: status || undefined
            });

            if (response.success) {
                setPayments(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    per_page: response.data.per_page
                });
            }
        } catch (err) {
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const handleViewPayment = async (id) => {
        try {
            setModalLoading(true);
            setShowModal(true);

            const response = await paymentService.getMyPaymentView(id);

            if (response.success) {
                setSelectedPayment(response.data);
            }
        } catch (err) {
            setError('Failed to load payment details');
            setShowModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="me-2 text-primary"
                        />
                        Payment History
                    </h2>
                    <p className="text-muted mb-0">
                        View all your affiliate payments
                    </p>
                </div>

                <Button
                    variant="outline-primary"
                    onClick={() => fetchPayments(1)}
                    className="rounded-pill px-4"
                >
                    <FontAwesomeIcon icon={faSync} className="me-2" />
                    Refresh
                </Button>
            </div>

            {error && (
                <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {/* Filter Card */}
            <Card className="shadow-sm border-0 rounded-4 mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">
                                    <FontAwesomeIcon
                                        icon={faFilter}
                                        className="me-2"
                                    />
                                    Filter by Status
                                </Form.Label>
                                <Form.Select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                    className="rounded-3"
                                >
                                    <option value="">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Button
                                variant="primary"
                                onClick={() => fetchPayments(1)}
                                className="w-100 rounded-3"
                            >
                                Apply
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Table Card */}
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Mail</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center py-5"
                                    >
                                        <Spinner animation="border" />
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center py-5 text-muted"
                                    >
                                        No payment history found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td className="fw-bold text-success">
                                            $
                                            {parseFloat(
                                                payment.price
                                            ).toFixed(2)}
                                        </td>
                                        <td>
                                            <Badge bg="info">
                                                {payment.pay_method}
                                            </Badge>
                                        </td>
                                         <td className="fw-bold text-success">
                                            
                                               { payment.email }
                                           
                                        </td>
                                        <td>
                                            <Badge
                                                bg={getStatusBadge(
                                                    payment.status
                                                )}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {new Date(
                                                payment.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="rounded-pill"
                                                onClick={() =>
                                                    handleViewPayment(
                                                        payment.id
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faEye}
                                                    className="me-1"
                                                />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {pagination.last_page > 1 && (
                        <Pagination className="justify-content-center mt-4">
                            {[...Array(pagination.last_page)].map(
                                (_, i) => (
                                    <Pagination.Item
                                        key={i + 1}
                                        active={
                                            pagination.current_page ===
                                            i + 1
                                        }
                                        onClick={() =>
                                            fetchPayments(i + 1)
                                        }
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                )
                            )}
                        </Pagination>
                    )}
                </Card.Body>
            </Card>

            {/* MODAL */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon
                            icon={faMoneyBillWave}
                            className="me-2 text-primary"
                        />
                        Payment Details
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {modalLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    ) : selectedPayment ? (
                        <Row>
                            <Col md={6}>
                                <Card className="border-0 bg-light rounded-4 mb-3">
                                    <Card.Body>
                                        <h6 className="text-muted">
                                            Payment Info
                                        </h6>
                                        <p><strong>ID:</strong> #{selectedPayment.id}</p>
                                        <p>
                                            <strong>Amount:</strong>{' '}
                                            <span className="text-success fw-bold">
                                                $
                                                {parseFloat(
                                                    selectedPayment.price
                                                ).toFixed(2)}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <Badge
                                                bg={getStatusBadge(
                                                    selectedPayment.status
                                                )}
                                            >
                                                {selectedPayment.status}
                                            </Badge>
                                        </p>
                                        <p>
                                            <FontAwesomeIcon
                                                icon={faCreditCard}
                                                className="me-2"
                                            />
                                            {selectedPayment.pay_method}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6}>
                                <Card className="border-0 bg-light rounded-4 mb-3">
                                    <Card.Body>
                                        <h6 className="text-muted">
                                            Additional Details
                                        </h6>
                                        <p>
                                            <strong>Title:</strong>{' '}
                                            {selectedPayment.title}
                                        </p>
                                        <p>
                                            <strong>Description:</strong>{' '}
                                            {selectedPayment.description}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon
                                                icon={faStickyNote}
                                                className="me-2"
                                            />
                                            {selectedPayment.notes || 'N/A'}
                                        </p>
                                        <p>
                                            <FontAwesomeIcon
                                                icon={faCalendarAlt}
                                                className="me-2"
                                            />
                                            {new Date(
                                                selectedPayment.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : null}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AffiliatePaymentHistory;