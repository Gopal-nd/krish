interface ItemCardProps {
    itemName: string;
    description: string;
    weight: string;
    priceRange: string;
    phoneLink: string;
    availabilityDate: string;
  }
  
  const ItemCard: React.FC<ItemCardProps> = ({
    itemName,
    description,
    weight,
    priceRange,
    phoneLink,
    availabilityDate,
  }) => {
    return (
      <div className="p-4 border rounded-lg hover:shadow-lg relative group">
        <h3 className="text-xl font-semibold">{itemName}</h3>
        <p className="text-gray-600">{description}</p>
        <p>Weight: {weight}kg</p>
        <p>Price: {priceRange}</p>
        <a href={phoneLink} className="text-blue-500 underline">
          Contact Seller
        </a>
  
        {/* Hover to display availability date */}
        <div className="absolute bottom-2 right-2 bg-gray-200 text-sm text-gray-700 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          Available on: {availabilityDate}
        </div>
      </div>
    );
  };
  
  export default ItemCard;
  