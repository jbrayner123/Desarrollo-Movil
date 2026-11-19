import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Pet } from '../types';

export interface NewPet {
  name: string;
  breed: string;
  ageYears: number;
  weightKg: number;
  photoUrl: string;
  vaccinesUpToDate: boolean;
  bio: string;
}

const pets = collection(db, 'pets');

export async function createPet(ownerId: string, pet: NewPet): Promise<string> {
  const ref = await addDoc(pets, { ...pet, ownerId, createdAt: serverTimestamp() });
  return ref.id;
}

/** Mascotas del usuario en vivo (la primera es la principal). */
export function subscribeMyPets(ownerId: string, onChange: (list: Pet[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(pets, where('ownerId', '==', ownerId)),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            ownerId: x.ownerId,
            name: x.name ?? '',
            breed: x.breed ?? '',
            ageYears: x.ageYears ?? 0,
            weightKg: x.weightKg ?? 0,
            photoUrl: x.photoUrl ?? '',
            vaccinesUpToDate: !!x.vaccinesUpToDate,
            bio: x.bio ?? ''
          };
        })
      ),
    onError
  );
}

export const updatePet = (id: string, data: Partial<NewPet>) => updateDoc(doc(db, 'pets', id), data);
