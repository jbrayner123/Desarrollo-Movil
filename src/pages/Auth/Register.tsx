import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { arrowBack, arrowForward, lockClosedOutline, mailOutline, medkitOutline, pawOutline, personOutline, storefrontOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import AuthField from './AuthField';
import PhotoPicker from '../../components/Shared/PhotoPicker';
import BusinessForm, { EMPTY_BUSINESS, validateBusiness, type BusinessFormErrors, type BusinessFormValue } from '../../components/Vets/BusinessForm';
import { useAuth } from '../../context/AuthContext';
import { email, matches, minLength, password, required, validateForm } from '../../helpers/validators';
import { authErrorMessage } from '../../services/auth.service';
import { resolveImage } from '../../services/cloudinary';
import type { Role } from '../../types';
import styles from './Auth.module.scss';

type AccountRole = Exclude<Role, 'admin'>;
type Step = 1 | 2 | 3;

const ROLE_CARDS: { role: AccountRole; title: string; text: string; icon: string; tone: string }[] = [
  { role: 'owner', title: 'Tengo una mascota', text: 'Publica paseos, reporta mascotas perdidas y conoce a tu comunidad.', icon: pawOutline, tone: 'mint' },
  { role: 'vet', title: 'Soy una veterinaria', text: 'Aparece en el directorio, recibe reseñas y atiende consultas por chat.', icon: medkitOutline, tone: 'lavender' },
  { role: 'petshop', title: 'Tengo un petshop', text: 'Publica promociones y llega a las familias con mascotas de tu zona.', icon: storefrontOutline, tone: 'pink' }
];

const EMPTY_ACCOUNT = { name: '', email: '', password: '', confirm: '' };
const EMPTY_PET = { petName: '', breed: '', age: '', weight: '' };

/** Registro en 3 pasos: tipo de cuenta, credenciales y datos segun el tipo. */
export default function Register() {
  const { register } = useAuth();
  const [step, setStep] = useState<Step>(1);
  // Transicion entre pasos: el paso actual sale hacia un lado y el nuevo entra por el otro.
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
  }, []);

  const goTo = (next: Step) => {
    if (next === step || leaving) return;
    setDirection(next > step ? 'forward' : 'back');
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => {
      setStep(next);
      setLeaving(false);
    }, 180);
  };
  const [role, setRole] = useState<AccountRole>('owner');

  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof typeof EMPTY_ACCOUNT, string>>>({});
  const [pet, setPet] = useState(EMPTY_PET);
  const [petPhoto, setPetPhoto] = useState<string | null>(null);
  const [petErrors, setPetErrors] = useState<Partial<Record<keyof typeof EMPTY_PET, string>>>({});
  const [business, setBusiness] = useState<BusinessFormValue>(EMPTY_BUSINESS);
  const [businessErrors, setBusinessErrors] = useState<BusinessFormErrors>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const isBusiness = role !== 'owner';

  const nextFromAccount = (e: FormEvent) => {
    e.preventDefault();
    const found = validateForm(account, {
      name: [required(isBusiness ? 'El nombre del responsable' : 'Tu nombre'), minLength(2, 'El nombre')],
      email: [required('El correo'), email],
      password: [password],
      confirm: [matches(account.password, 'Las contraseñas no coinciden.')]
    });
    setAccountErrors(found);
    if (Object.keys(found).length === 0) goTo(3);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isBusiness) {
      const found = validateBusiness(business);
      setBusinessErrors(found);
      if (Object.keys(found).length) return;
    } else {
      const found = validateForm(pet, { petName: [required('El nombre de tu mascota')] });
      if (pet.age && !(Number(pet.age) >= 0 && Number(pet.age) <= 30)) found.age = 'Edad no válida.';
      if (pet.weight && !(Number(pet.weight) > 0 && Number(pet.weight) <= 120)) found.weight = 'Peso no válido.';
      setPetErrors(found);
      if (Object.keys(found).length) return;
    }

    setLoading(true);
    try {
      if (isBusiness) {
        setProgress(business.logo ? 'Subiendo el logo...' : 'Creando la cuenta...');
        const logoUrl = await resolveImage(business.logo, 'negocios');
        setProgress('Creando la cuenta...');
        await register({
          role,
          displayName: account.name,
          email: account.email,
          password: account.password,
          business: {
            name: business.name.trim(),
            tagline: business.tagline.trim(),
            phone: business.phone.trim(),
            schedule: business.schedule.trim(),
            services: business.services,
            address: business.place!.address.trim(),
            neighborhood: business.place!.neighborhood.trim(),
            directions: business.directions.trim(),
            location: business.place!.location,
            logoUrl
          }
        });
      } else {
        setProgress(petPhoto ? 'Subiendo la foto...' : 'Creando la cuenta...');
        const photoUrl = await resolveImage(petPhoto, 'mascotas');
        setProgress('Creando la cuenta...');
        await register({
          role: 'owner',
          displayName: account.name,
          email: account.email,
          password: account.password,
          pet: {
            name: pet.petName.trim(),
            breed: pet.breed.trim() || 'Sin raza definida',
            ageYears: Number(pet.age) || 0,
            weightKg: Number(pet.weight) || 0,
            photoUrl,
            vaccinesUpToDate: false,
            bio: ''
          }
        });
      }
      // La redireccion al feed la hace AppRoutes cuando la sesion queda lista:
      // navegar tambien aqui duplicaria la seccion /app en el historial de Ionic.
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const back = () => step > 1 && goTo((step - 1) as Step);

  const panelClass = [
    styles.stepPanel,
    leaving ? (direction === 'forward' ? styles.leaveLeft : styles.leaveRight) : direction === 'forward' ? styles.enterRight : styles.enterLeft
  ].join(' ');

  return (
    <IonPage>
      <IonContent>
        <div className={styles.page}>
          <div className={styles.registerTop}>
            {step > 1 ? (
              <button type="button" className={styles.back} onClick={back} aria-label="Paso anterior">
                <IonIcon icon={arrowBack} />
              </button>
            ) : (
              <span className={styles.brandSmall}>
                <IonIcon icon={pawOutline} aria-hidden="true" />
              </span>
            )}
            <div className={styles.steps} aria-label={`Paso ${step} de 3`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={n <= step ? styles.stepOn : ''} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <section key="s1" className={panelClass}>
              <h1 className={styles.title}>Únete a la manada.</h1>
              <p className={styles.subtitle}>¿Cómo vas a usar la app?</p>
              <div className={styles.roles} role="radiogroup" aria-label="Tipo de cuenta">
                {ROLE_CARDS.map((c, i) => (
                  <button
                    key={c.role}
                    type="button"
                    role="radio"
                    aria-checked={role === c.role}
                    className={`${styles.roleCard} ${role === c.role ? styles.roleActive : ''} enter-up`}
                    style={{ '--i': i } as CSSProperties}
                    onClick={() => setRole(c.role)}
                  >
                    <span className={`${styles.roleIcon} ${styles[c.tone]}`}>
                      <IonIcon icon={c.icon} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{c.title}</strong>
                      <small>{c.text}</small>
                    </span>
                  </button>
                ))}
              </div>
              <button type="button" className={styles.next} onClick={() => goTo(2)}>
                <span>Continuar</span>
                <span className={styles.nextLine} aria-hidden="true" />
                <IonIcon icon={arrowForward} aria-hidden="true" />
              </button>
            </section>
          )}

          {step === 2 && (
            <form key="s2" className={`${styles.form} ${panelClass}`} onSubmit={nextFromAccount} noValidate>
              <div>
                <h1 className={styles.title}>Crea tu cuenta.</h1>
                <p className={styles.subtitle}>{isBusiness ? 'Datos de la persona responsable del negocio.' : 'Con estos datos inicias sesión.'}</p>
              </div>
              <AuthField
                id="reg-name"
                label={isBusiness ? 'Nombre del responsable' : 'Tu nombre'}
                icon={personOutline}
                autoComplete="name"
                placeholder="Mariana López"
                value={account.name}
                error={accountErrors.name}
                onChange={(v) => setAccount((a) => ({ ...a, name: v }))}
              />
              <AuthField
                id="reg-email"
                label="Correo electrónico"
                icon={mailOutline}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="nombre@correo.com"
                value={account.email}
                error={accountErrors.email}
                onChange={(v) => setAccount((a) => ({ ...a, email: v }))}
              />
              <AuthField
                id="reg-password"
                label="Contraseña"
                icon={lockClosedOutline}
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres, letras y números"
                value={account.password}
                error={accountErrors.password}
                onChange={(v) => setAccount((a) => ({ ...a, password: v }))}
              />
              <AuthField
                id="reg-confirm"
                label="Confirmar contraseña"
                icon={lockClosedOutline}
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={account.confirm}
                error={accountErrors.confirm}
                onChange={(v) => setAccount((a) => ({ ...a, confirm: v }))}
              />
              <button type="submit" className={styles.next}>
                <span>Continuar</span>
                <span className={styles.nextLine} aria-hidden="true" />
                <IonIcon icon={arrowForward} aria-hidden="true" />
              </button>
            </form>
          )}

          {step === 3 && (
            <form key="s3" className={`${styles.form} ${panelClass}`} onSubmit={submit} noValidate>
              <div>
                <h1 className={styles.title}>{isBusiness ? 'Tu negocio.' : 'Tu mascota.'}</h1>
                <p className={styles.subtitle}>
                  {isBusiness ? 'Así te verán las familias en el directorio y en el mapa.' : 'Cuéntale a la comunidad quién te acompaña.'}
                </p>
              </div>

              {isBusiness ? (
                <BusinessForm type={role as 'vet' | 'petshop'} value={business} errors={businessErrors} onChange={setBusiness} />
              ) : (
                <>
                  <PhotoPicker shape="round" value={petPhoto} onChange={setPetPhoto} hint="Foto de tu mascota (opcional)" />
                  <AuthField
                    id="pet-name"
                    label="Nombre de tu mascota"
                    icon={pawOutline}
                    placeholder="Milo"
                    value={pet.petName}
                    error={petErrors.petName}
                    onChange={(v) => setPet((p) => ({ ...p, petName: v }))}
                  />
                  <AuthField id="pet-breed" label="Raza" icon={pawOutline} placeholder="Golden Retriever" value={pet.breed} onChange={(v) => setPet((p) => ({ ...p, breed: v }))} />
                  <div className={styles.twoCols}>
                    <AuthField id="pet-age" label="Edad (años)" icon={pawOutline} inputMode="numeric" placeholder="4" value={pet.age} error={petErrors.age} onChange={(v) => setPet((p) => ({ ...p, age: v.replace(/[^\d]/g, '') }))} />
                    <AuthField id="pet-weight" label="Peso (kg)" icon={pawOutline} inputMode="decimal" placeholder="30" value={pet.weight} error={petErrors.weight} onChange={(v) => setPet((p) => ({ ...p, weight: v.replace(/[^\d.]/g, '') }))} />
                  </div>
                </>
              )}

              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? (
                  <span className={styles.progress}>
                    <IonSpinner name="dots" />
                    {progress}
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>
          )}

          <p className={styles.switch}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
