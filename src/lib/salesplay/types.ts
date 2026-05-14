/**
 * Typed shapes for SalesPlay REST API v1.0
 * @see https://developer.salesplay.com/
 */

export type SalesPlaySuccessEnvelope = {
  success?: {
    code?: string;
    details?: string;
    message?: string;
    reference_number?: string;
  };
};

export type SalesPlayCustomer = {
  id?: string;
  customer_code?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  total_points?: string;
};

export type SalesPlayCustomersListResponse = {
  customers?: SalesPlayCustomer[];
  cursor?: string;
};

export type SalesPlayCreateCustomerRequest = {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  customer_code?: string;
  country_code?: string;
  description?: string;
};

export type SalesPlayOnlineOrderItem = {
  product_code: string;
  product_name: string;
  product_qty: number;
  product_unit_price: number;
  product_price: number;
  product_cost?: number;
  product_remark?: string;
  product_modifiers?: unknown[];
  product_taxes?: unknown[];
  product_discounts?: unknown[];
};

export type SalesPlayOnlineOrderPayment = {
  payment_type: string;
  payment_amount: string | number;
  payment_reference?: string;
  is_advance?: number;
};

export type SalesPlayCreateOnlineOrderRequest = {
  shop_id: string;
  order_date: string;
  order_reference_number: string;
  order_reference_id: string;
  order_total: number;
  channel_order_status_id: number;
  channel_order_status_name: string;
  order_comment: string;
  table_code: string;
  order_type: string;
  target_terminal: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  order_date_time: string;
  order_items: SalesPlayOnlineOrderItem[];
  fixed_charges?: unknown[];
  order_total_discounts?: unknown[];
  order_payments: SalesPlayOnlineOrderPayment[];
};

export type SalesPlayCreateOnlineOrderResponse = SalesPlaySuccessEnvelope & {
  success?: SalesPlaySuccessEnvelope["success"] & {
    order_reference_id?: string;
    order_reference_number?: string;
    system_unique_id?: string;
    order_date?: string;
  };
};
