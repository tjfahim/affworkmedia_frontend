// pages/admin/AffiliateManagement.js
import React, { useState, useEffect } from 'react';
import { Button, Tabs, Tab } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUsers, faSync } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import affiliateAPI from '../../services/affiliateService';

// Import sub-components
import AffiliateStats from '../components/affiliate/AffiliateStats';
import AffiliateTable from '../components/affiliate/AffiliateTable';
import AffiliateFormModal from '../components/affiliate/AffiliateFormModal';
import AffiliateViewModal from '../components/affiliate/AffiliateViewModal';
import AffiliatePagination from '../components/affiliate/AffiliatePagination';
import PaymentMethodStatusManager from '../components/affiliate/PaymentMethodStatusManager';

const AffiliateManagement = () => {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [viewingAffiliate, setViewingAffiliate] = useState(null);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formLoading, setFormLoading] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async (page = 1) => {
    try {
      setLoading(true);
      const response = await affiliateAPI.getAffiliates(page, pagination.per_page);
      
      if (response.data && response.data.success === true && response.data.affiliates) {
        if (Array.isArray(response.data.affiliates.data)) {
          setAffiliates(response.data.affiliates.data);
          setPagination({
            current_page: response.data.affiliates.current_page,
            last_page: response.data.affiliates.last_page,
            total: response.data.affiliates.total,
            per_page: response.data.affiliates.per_page
          });
        } else {
          setAffiliates([]);
          toast.error('Invalid affiliate data format');
        }
      } else {
        setAffiliates([]);
        toast.error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch affiliates');
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchAffiliates(page);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateAffiliate = async (formData) => {
    setFormLoading(true);
    
    try {
      // Validate password
      if (formData.password !== formData.password_confirmation) {
        toast.error('Passwords do not match');
        setFormLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setFormLoading(false);
        return;
      }

      const response = await affiliateAPI.createAffiliate(formData);
      if (response.data && response.data.success === true) {
        toast.success('Affiliate created successfully!');
        setShowFormModal(false);
        fetchAffiliates(pagination.current_page);
      } else {
        toast.error(response.data?.message || 'Failed to create affiliate');
      }
    } catch (error) {
      console.error('Create affiliate error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to create affiliate');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAffiliate = async (formData) => {
    setFormLoading(true);
    
    try {
      // Create a clean copy of the data for update
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status,
        address: formData.address,
        balance: formData.balance,
        pay_method: formData.pay_method,
        account_email: formData.account_email,
        skype: formData.skype,
        company: formData.company,
        website: formData.website,
        promotion_description: formData.promotion_description,
        payoneer: formData.payoneer,
        paypal: formData.paypal,
        binance: formData.binance,
        bank_details: formData.bank_details,
        other_payment_method_description: formData.other_payment_method_description,
        default_affiliate_commission_1: formData.default_affiliate_commission_1,
        default_affiliate_commission_2: formData.default_affiliate_commission_2,
        default_affiliate_commission_3: formData.default_affiliate_commission_3,
        sale_hide: formData.sale_hide
      };

      // Only include password if it's provided and not empty
      if (formData.password && formData.password.trim() !== '') {
        // Validate password length
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setFormLoading(false);
          return;
        }
        
        // Validate password confirmation
        if (formData.password !== formData.password_confirmation) {
          toast.error('Passwords do not match');
          setFormLoading(false);
          return;
        }
        
        updateData.password = formData.password;
      }

      const response = await affiliateAPI.updateAffiliate(selectedAffiliate.id, updateData);
      
      if (response.data && response.data.success === true) {
        toast.success('Affiliate updated successfully!');
        setShowFormModal(false);
        fetchAffiliates(pagination.current_page);
      } else {
        toast.error(response.data?.message || 'Failed to update affiliate');
      }
    } catch (error) {
      console.error('Update affiliate error:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to update affiliate');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAffiliate = async (affiliateId) => {
    if (window.confirm('Are you sure you want to delete this affiliate? This action cannot be undone.')) {
      try {
        const response = await affiliateAPI.deleteAffiliate(affiliateId);
        if (response.data && response.data.success === true) {
          toast.success('Affiliate deleted successfully!');
          fetchAffiliates(pagination.current_page);
        } else {
          toast.error(response.data?.message || 'Failed to delete affiliate');
        }
      } catch (error) {
        console.error('Delete affiliate error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete affiliate');
      }
    }
  };

  const handleStatusToggle = async (affiliate) => {
    setTogglingStatus(affiliate.id);
    try {
      const newStatus = affiliate.status === 'active' ? 'inactive' : 
                        affiliate.status === 'inactive' ? 'suspended' : 'active';
      const response = await affiliateAPI.updateStatus(affiliate.id, newStatus);
      
      if (response.data && response.data.success === true) {
        toast.success(`Affiliate status changed to ${newStatus}`);
        setAffiliates(affiliates.map(u => 
          u.id === affiliate.id ? { ...u, status: newStatus } : u
        ));
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status toggle error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const openEditModal = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setShowFormModal(true);
  };

  const openViewModal = (affiliate) => {
    setViewingAffiliate(affiliate);
    setShowViewModal(true);
  };

  const openCreateModal = () => {
    setSelectedAffiliate(null);
    setShowFormModal(true);
  };

  const closeModals = () => {
    setShowFormModal(false);
    setShowViewModal(false);
    setSelectedAffiliate(null);
    setViewingAffiliate(null);
  };

  // Filter users based on active tab
  const getFilteredAffiliates = () => {
    if (activeTab === 'all') return affiliates;
    return affiliates.filter(affiliate => affiliate.status === activeTab);
  };

  const filteredAffiliates = getFilteredAffiliates();
  const totalBalance = affiliates.reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-2">
            <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
            Affiliate Management
          </h2>
          <p className="text-muted">Manage affiliate users, commissions, and payment settings</p>
        </div>
        {hasPermission('create affiliates') && activeTab !== 'payment-status' && (
          <Button variant="primary" onClick={openCreateModal}>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Add Affiliate
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Affiliates" />
        <Tab eventKey="active" title="Active" />
        <Tab eventKey="inactive" title="Inactive" />
        <Tab eventKey="suspended" title="Suspended" />
        <Tab 
          eventKey="payment-status" 
          title={
            <span>
              <FontAwesomeIcon icon={faSync} className="me-2" />
              Payment Status Manager
            </span>
          } 
        />
      </Tabs>

      {/* Content based on active tab */}
      {activeTab !== 'payment-status' ? (
        <>
          {/* Statistics Cards */}
          <AffiliateStats affiliates={affiliates} totalBalance={totalBalance} />

          {/* Affiliates Table */}
          <div className="border-0 shadow-sm rounded bg-white">
            <AffiliateTable 
              affiliates={filteredAffiliates}
              loading={loading}
              togglingStatus={togglingStatus}
              onView={openViewModal}
              onEdit={openEditModal}
              onDelete={handleDeleteAffiliate}
              onStatusToggle={handleStatusToggle}
              hasPermission={hasPermission}
            />
          </div>

          {/* Pagination */}
          <AffiliatePagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      ) : (
        /* Payment Status Manager Component */
        <PaymentMethodStatusManager />
      )}

      {/* Affiliate Form Modal */}
      <AffiliateFormModal
        show={showFormModal}
        onHide={closeModals}
        onSubmit={selectedAffiliate ? handleUpdateAffiliate : handleCreateAffiliate}
        selectedAffiliate={selectedAffiliate}
        loading={formLoading}
      />

      {/* Affiliate View Modal */}
      <AffiliateViewModal
        show={showViewModal}
        onHide={closeModals}
        affiliate={viewingAffiliate}
        onEdit={openEditModal}
      />
    </div>
  );
};

export default AffiliateManagement;