import type { CollectionItem } from "../types";
import "./ItemCard.scss";

interface ItemCardProps {
  item: CollectionItem;
  onClick: () => void;
}

function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div className="item-card" onClick={onClick}>
      <div className="item-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="placeholder">📦</div>
        )}
      </div>
      <div className="item-info">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
      </div>
    </div>
  );
}

export default ItemCard;
