import { ACCESSORIES, AVATAR_CATEGORIES, formatAvatar } from '../avatars';
import { AvatarImage } from './AvatarImage';
import { Header } from './Header';

// Nur im Dev-Server erreichbar (#/avatare): zeigt jedes Accessoire auf mehreren Köpfen,
// damit sich die Platzierung prüfen und nachjustieren lässt.
export function AvatarGallery() {
  const bases = AVATAR_CATEGORIES[0].items.slice(0, 4);

  return (
    <>
      <Header />
      <main className="home avatar-gallery">
        <h1>Accessoire-Platzierung</h1>
        <p>
          Jede Zeile ein Accessoire, jede Spalte ein anderer Kopf. Die Platzierung steht in Klammern.
        </p>
        <table className="avatar-gallery-table">
          <thead>
            <tr>
              <th>Accessoire</th>
              {bases.map((base) => (
                <th key={base.slug}>{base.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                ohne <small>(–)</small>
              </th>
              {bases.map((base) => (
                <td key={base.slug}>
                  <AvatarImage avatar={formatAvatar({ base: base.slug, accessory: null, background: 'sky' })} name="x" size="xl" />
                </td>
              ))}
            </tr>
            {ACCESSORIES.map((accessory) => (
              <tr key={accessory.slug}>
                <th scope="row">
                  {accessory.label} <small>({accessory.placement})</small>
                </th>
                {bases.map((base) => (
                  <td key={base.slug}>
                    <AvatarImage
                      avatar={formatAvatar({ base: base.slug, accessory: accessory.slug, background: 'sky' })}
                      name="x"
                      size="xl"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
