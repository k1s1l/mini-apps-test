import type { Product, Selection } from '../data/types';
import { isValueSelectable } from '../lib/product';
import { formatPrice } from '../lib/format';
import { telegram } from '../services/telegram';

interface Props {
  product: Product;
  selection: Selection;
  onChange(sel: Selection, groupId: string): void;
  /** Підсвітити групи, які ще треба обрати. */
  highlightMissing?: boolean;
  compact?: boolean;
}

export function OptionPicker({ product, selection, onChange, highlightMissing, compact }: Props) {
  return (
    <div className={`options ${compact ? 'is-compact' : ''}`}>
      {product.options.map((g) => {
        const chosen = g.values.find((v) => v.id === selection[g.id]);
        const missing = highlightMissing && !chosen;
        const isColor = g.id === 'color';
        return (
          <fieldset key={g.id} className={`opt-group ${missing ? 'is-missing' : ''}`}>
            <legend>
              {g.label}
              {chosen ? <b>{chosen.label}</b> : <em>{missing ? `оберіть ${g.label.toLowerCase()}` : 'не обрано'}</em>}
            </legend>
            <div className={`opt-values ${isColor ? 'is-color' : ''}`}>
              {g.values.map((v) => {
                const selectable = isValueSelectable(product, g.id, v.id, selection);
                const active = selection[g.id] === v.id;
                const title = selectable ? v.label : `${v.label} — немає в наявності`;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`opt ${active ? 'is-active' : ''} ${selectable ? '' : 'is-off'} ${isColor ? 'opt-color' : ''}`}
                    disabled={!selectable}
                    aria-pressed={active}
                    aria-label={title}
                    title={title}
                    onClick={() => {
                      telegram.haptic('select');
                      onChange({ ...selection, [g.id]: v.id }, g.id);
                    }}
                  >
                    {isColor ? (
                      <span className="swatch" style={{ background: v.swatch ?? '#888' }} />
                    ) : (
                      <>
                        <span>{v.label}</span>
                        {v.price != null && g.values.some((x) => x.price !== v.price) && (
                          <small>{formatPrice(v.price)}</small>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
