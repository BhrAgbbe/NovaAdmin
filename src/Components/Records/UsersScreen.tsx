import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { normalizeSearch } from "@/Utils/format";
import { getUsers } from "@/Utils/services/userApi";
import type { User } from "@/types/user";
import RecordList from "./RecordList";

const Name = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    background: var(--tint);
    color: var(--brand-ink);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
    font:
      700 11px Inter,
      sans-serif;
  }
`;
const contact = (text: string) => (
  <bdi dir="ltr" className="latin">
    {text}
  </bdi>
);

export default function UsersScreen() {
  const { m } = useMessages();
  const additions = useAppSelector((state) => state.records.users);
  return (
    <RecordList<User>
      title={m.users}
      description={m.usersHelp}
      eyebrow="02  /  PEOPLE"
      add={m.addUser}
      createPath={ROUTES.createUser}
      search={m.searchUsers}
      empty={m.noUsers}
      error={m.usersLoadError}
      icon="users"
      createdMessage={m.userCreated}
      additions={additions}
      request={getUsers}
      matches={(user, term) =>
        normalizeSearch(
          [user.firstName + " " + user.lastName, user.username, user.email].join(" ")
        ).includes(term)
      }
      columns={[
        {
          label: m.fullName,
          width: "29%",
          render: (item) => (
            <Name>
              <span aria-hidden="true">{(item.firstName[0] + item.lastName[0]).toUpperCase()}</span>
              <strong>
                <bdi>
                  {item.firstName} {item.lastName}
                </bdi>
              </strong>
            </Name>
          ),
        },
        { label: m.username, width: "23%", render: (item) => contact(item.username) },
        { label: m.email, width: "26%", render: (item) => contact(item.email) },
        { label: m.phone, width: "22%", render: (item) => contact(item.phone) },
      ]}
    />
  );
}
