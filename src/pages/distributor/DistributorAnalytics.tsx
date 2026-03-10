import DistributorLayout from "@/components/distributor/DistributorLayout";
import OrderAnalytics from "@/components/distributor/OrderAnalytics";

const DistributorAnalytics = () => {
  return (
    <DistributorLayout title="Order Analytics" subtitle="Track your purchase history and trends">
      <OrderAnalytics />
    </DistributorLayout>
  );
};

export default DistributorAnalytics;
