import { Order, OrderItem } from '../models/index.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const {
      subtotal,
      tax,
      shipping_cost,
      total,
      shipping_address,
      billing_address,
      notes,
      items
    } = req.body;

    // Create order
    const order = new Order({
      user_id: req.user._id,
      subtotal,
      tax: tax || 0,
      shipping_cost: shipping_cost || 0,
      total,
      shipping_address,
      billing_address,
      notes: notes || '',
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'mock'
    });

    await order.save();

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order._id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    await OrderItem.insertMany(orderItems);

    // Populate order with items for response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'user_id',
        select: 'email full_name'
      });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ created_at: -1 });

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id });
        return {
          ...order.toObject(),
          items
        };
      })
    );

    res.status(200).json({
      success: true,
      data: ordersWithItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'email full_name')
      .sort({ created_at: -1 });

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order_id: order._id });
        return {
          ...order.toObject(),
          items
        };
      })
    );

    res.status(200).json({
      success: true,
      data: ordersWithItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id)
      .populate('user_id', 'email full_name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (order.user_id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get order items
    const items = await OrderItem.find({ order_id: order._id });

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user_id', 'email full_name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Delete order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete order items first
    await OrderItem.deleteMany({ order_id: id });

    // Delete order
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};